import {
    AngularNodeAppEngine,
    createNodeRequestHandler,
    isMainModule,
    writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Proxy para o backend Django (/api, /admin, /static).
// No Docker o frontend (:4000) precisa encaminhar ao backend (:8000),
// pois o browser chama caminhos relativos como /api/... .
const BACKEND_URL = process.env['BACKEND_URL'] || 'http://localhost:8000';

async function proxyParaBackend(req: express.Request, res: express.Response) {
    const destino = `${BACKEND_URL}${req.originalUrl}`;
    try {
        const cabecalhos: Record<string, string> = {};
        for (const [chave, valor] of Object.entries(req.headers)) {
            if (typeof valor === 'string') {
                cabecalhos[chave] = valor;
            } else if (Array.isArray(valor)) {
                cabecalhos[chave] = valor.join(', ');
            }
        }
        delete cabecalhos['host'];
        delete cabecalhos['content-length'];

        const temCorpo = !['GET', 'HEAD'].includes(req.method);
        let corpo: Buffer | undefined;
        if (temCorpo) {
            corpo = await new Promise<Buffer>((resolve, reject) => {
                const partes: Buffer[] = [];
                req.on('data', (parte: Buffer) => partes.push(parte));
                req.on('end', () => resolve(Buffer.concat(partes)));
                req.on('error', reject);
            });
        }
        const resposta = await fetch(destino, {
            method: req.method,
            headers: cabecalhos,
            body: corpo as unknown as BodyInit | undefined,
        });

        res.status(resposta.status);
        resposta.headers.forEach((valor, chave) => {
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(chave)) {
                res.setHeader(chave, valor);
            }
        });
        if (resposta.body) {
            const { Readable } = await import('node:stream');
            Readable.fromWeb(resposta.body as never).pipe(res);
        } else {
            res.end();
        }
    } catch {
        res.status(502).json({ detail: 'Backend indisponível.' });
    }
}

app.use('/api', proxyParaBackend);
app.use('/admin', proxyParaBackend);
app.use('/static', proxyParaBackend);

app.use(
    express.static(browserDistFolder, {
        maxAge: '1y',
        index: false,
        redirect: false,
    }),
);

app.use((req, res, next) => {
    angularApp
        .handle(req)
        .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
        .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
    const port = process.env['PORT'] || 4000;
    app.listen(port, (error) => {
        if (error) {
            throw error;
        }

        console.log(`Node Express server listening on http://localhost:${port}`);
    });
}

export const reqHandler = createNodeRequestHandler(app);
