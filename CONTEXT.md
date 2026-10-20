# JobApplications

Sistema para acompanhar candidaturas de emprego e as plataformas onde elas
foram registradas.

## Language

**Plataforma**:
Canal onde uma candidatura é registrada, como LinkedIn, Gupy ou o site da
empresa.
_Avoid_: Convênio, portal, site.

**Candidatura**:
Registro de uma vaga à qual o usuário se candidatou, vinculada a uma
Plataforma.
_Avoid_: Aplicação, vaga, inscrição.

**Status**:
Estágio de uma Candidatura no processo seletivo: Enviado, Rejeitado,
Entrevista, Proposta Recebida ou Aprovada.
_Avoid_: Estado, fase, situação.

**EmpresaMonitorada**:
Organização cujo site de vagas o usuário acompanha em busca de novas
oportunidades. Não se confunde com o campo `empresa` de uma Candidatura.
_Avoid_: Empresa, companhia, alvo.

**Última consulta**:
Momento em que o site de vagas de uma EmpresaMonitorada foi verificado pela
última vez. Empresas nunca consultadas usam a data sentinel
`0001-01-01T00:00:00`.
_Avoid_: Última verificação, última checagem.
