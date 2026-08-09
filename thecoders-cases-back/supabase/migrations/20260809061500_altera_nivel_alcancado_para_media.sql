-- nivel_alcancado passa a guardar a nota geral como a média das 6 categorias
-- (escala 0.0 a 10.0, uma casa decimal), em vez de um inteiro na escala antiga (0-100).
--
-- Os registros de teste feitos durante o desenvolvimento do B09 usam a escala antiga
-- (ex: 80) e violariam o novo check (0-10), então limpamos antes de alterar o tipo.
-- Seguro neste momento porque são apenas dados de teste manual via Swagger.
truncate table resultados;

alter table resultados
    alter column nivel_alcancado type numeric(3,1) using nivel_alcancado::numeric(3,1),
    add constraint nivel_alcancado_range check (nivel_alcancado between 0 and 10);