export class ReadCSV {
  constructor(caminhoArquivo) {
    const conteudo = open(caminhoArquivo);

    const linhas = conteudo.split('\n').filter((linha) => linha.trim() !== '');

    this.cabecalho = linhas[0].split(',');

    this.dados = linhas.slice(1).map((linha) => {
      const valores = linha.split(',');

      const objeto = {};
      this.cabecalho.forEach((coluna, index) => {
        objeto[coluna] = valores[index];
      });

      return objeto;
    });
  }

  dadosRandomicosCSV() {
    const index = Math.floor(Math.random() * this.dados.length);
    return this.dados[index];
  }
}
