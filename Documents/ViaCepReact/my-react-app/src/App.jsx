import { useState } from 'react';
import './App.css';

function App() {
  // Estado para armazenar os campos do formulário
  const [formData, setFormData] = useState({
    cep: '',
    logradouro: '',
    bairro: '',
    cidade: '',
    uf: '',
  });

  // Atualiza os inputs conforme o usuário digita
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Função para limpar todos os campos
  const limparFormulario = () => {
    setFormData({
      cep: '',
      logradouro: '',
      bairro: '',
      cidade: '',
      uf: '',
    });
  };

  // Função para buscar o CEP na API do ViaCEP
  const pesquisarCep = async () => {
    const cepLimpo = formData.cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      alert('CEP inválido! Digite 8 números.');
      return;
    }

    const url = `https://viacep.com.br/ws/${cepLimpo}/json/`;

    try {
      const resposta = await fetch(url);
      const dados = await resposta.json();

      if (dados.erro) {
        alert('CEP não encontrado!');
        limparFormulario();
      } else {
        // Preenche o formulário atualizando o estado
        setFormData({
          cep: formData.cep,
          logradouro: dados.logradouro || '',
          bairro: dados.bairro || '',
          cidade: dados.localidade || '',
          uf: dados.uf || '',
        });
      }
    } catch (erro) {
      console.error('Erro na requisição da API:', erro);
    }
  };

  return (
    <>
      <h1 id="Titulo">BUSCAR CEP</h1>
      <form id="formulario">
        <div>
          <label htmlFor="cep">CEP:</label>
          <input
            type="text"
            id="cep"
            maxLength="9"
            placeholder="00000-000"
            value={formData.cep}
            onChange={handleChange}
            onBlur={pesquisarCep} // Evento disparado ao sair do campo CEP
          />
          <br />
          <div>
            <p>Seu cep é: {formData.cep}</p>
          </div>
        </div>

        <div>
          <label htmlFor="logradouro">Rua / Logradouro:</label>
          <input
            type="text"
            id="logradouro"
            value={formData.logradouro}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="bairro">Bairro:</label>
          <input
            type="text"
            id="bairro"
            value={formData.bairro}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="cidade">Cidade:</label>
          <input
            type="text"
            id="cidade"
            value={formData.cidade}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="uf">Estado (UF):</label>
          <input
            type="text"
            id="uf"
            value={formData.uf}
            onChange={handleChange}
          />
        </div>

        <button
          type="button"
          id="btn-limpar"
          className="btn"
          onClick={limparFormulario} // Evento do botão limpar
        >
          Limpar Campos
        </button>
      </form>
    </>
  );
}

export default App;