-- Adiciona notas por categoria avaliadas pela IA (escala 0.0 a 10.0, uma casa decimal).
-- Mantém nivel_alcancado como a nota geral (0-100) usada para a decisão de aprovado/reprovado.
alter table resultados
    add column nota_raciocinio_logico numeric(3,1) check (nota_raciocinio_logico between 0 and 10),
    add column nota_qualidade_tecnica numeric(3,1) check (nota_qualidade_tecnica between 0 and 10),
    add column nota_resolucao_problemas numeric(3,1) check (nota_resolucao_problemas between 0 and 10),
    add column nota_comunicacao numeric(3,1) check (nota_comunicacao between 0 and 10),
    add column nota_priorizacao numeric(3,1) check (nota_priorizacao between 0 and 10),
    add column nota_colaboracao numeric(3,1) check (nota_colaboracao between 0 and 10);