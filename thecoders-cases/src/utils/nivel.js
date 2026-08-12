// Utilitários para lidar com o nível de expertise do usuário (ESTAGIARIO, JUNIOR, SENIOR)
// vindo do backend (`nivel_expertise`), usados para exibir o nível na Navbar e no perfil.

export const NIVEL_ABREVIACAO = {
    ESTAGIARIO: "E",
    JUNIOR: "J",
    SENIOR: "S",
};

export const NIVEL_LABEL = {
    ESTAGIARIO: "Estagiário",
    JUNIOR: "Júnior",
    SENIOR: "Sênior",
};

// Normaliza valores como "Estagiário", "estagiario", " Júnior " etc. para a
// chave em maiúsculas e sem acento usada nos mapas acima (ex.: "ESTAGIARIO").
export const padronizarNivel = (nivel) => {
    if (!nivel) return "ESTAGIARIO";
    return String(nivel)
        .trim()
        .toUpperCase()
        .replace("Á", "A")
        .replace("Í", "I")
        .replace("É", "E")
        .replace("Ó", "O")
        .replace("Ú", "U");
};

// Retorna a abreviação (E/J/S) usada pelo componente <Nivel /> na Navbar,
// a partir de um valor cru de nivel_expertise (ex.: vindo da API).
export const abreviarNivel = (nivel) => {
    const chave = padronizarNivel(nivel);
    return NIVEL_ABREVIACAO[chave] ?? "E";
};