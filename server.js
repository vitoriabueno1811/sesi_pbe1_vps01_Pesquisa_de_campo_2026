const express = require("express")
const fs = require("fs")
const path = require("path")
const API_URL = "http://127.0.0.1:3000/usos";

const caminhoArquivo = path.join(__dirname, "dados.json")
let usos = require(caminhoArquivo)

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const salvarEmArquivo = () => {
    fs.writeFileSync(caminhoArquivo, JSON.stringify(usos, null, 2), "utf-8")
}

const mostrarUsos = (req, res) => {
    const { nivel_risco, tipo } = req.query
    let resultado = usos

    if (nivel_risco) {
        resultado = resultado.filter(u => u.nivel_risco.toLowerCase() === nivel_risco.toLowerCase())
    }

    if (tipo) {
        resultado = resultado.filter(u => u.tipo.toLowerCase() === tipo.toLowerCase())
    }

    res.send(resultado)
}

const mostrarUsoPorId = (req, res) => {
    const id = req.params.id
    const uso = usos.find(u => String(u.id) === String(id))

    if (uso) {
        res.send(uso)
    } else {
        res.status(404).send("Registro de uso não encontrado")
    }
}

const novoUso = (req, res) => {
    if (req.body && Object.keys(req.body).length > 0) {
        // Calcula autoIncrement
        const maiorId = usos.reduce((max, item) => (item.id > max ? item.id : max), 0)
        const registro = {
            id: maiorId + 1,
            ...req.body
        }

        usos.push(registro)
        salvarEmArquivo()

        res.status(201).send(registro)
    } else {
        res.status(400).send("Erro ao receber dados do uso de IA")
    }
}

const excluirUso = (req, res) => {
    const id = req.params.id
    const indice = usos.findIndex(u => String(u.id) === String(id))

    if (indice !== -1) {
        usos.splice(indice, 1)
        salvarEmArquivo()
        res.send("Uso de IA excluído com sucesso")
    } else {
        res.status(404).send("Registro não encontrado")
    }
}

const alterarUso = (req, res) => {
    const id = req.params.id
    const dados = req.body
    let encontrado = false

    usos.forEach(uso => {
        if (String(uso.id) === String(id)) {
            uso.sistema = dados.sistema ?? uso.sistema
            uso.tipo = dados.tipo ?? uso.tipo
            uso.finalidade = dados.finalidade ?? uso.finalidade
            uso.tecnologia = dados.tecnologia ?? uso.tecnologia
            uso.nivel_risco = dados.nivel_risco ?? uso.nivel_risco
            uso.possui_revisao_humana = dados.possui_revisao_humana ?? uso.possui_revisao_humana
            encontrado = true
        }
    })

    if (encontrado) {
        salvarEmArquivo()
        res.send("Uso de IA atualizado com sucesso!")
    } else {
        res.status(404).send("Registro não encontrado para atualização")
    }
}

app.get("/usos", (req, res) => {
    let resultado = usos;
    
    if (req.query.nivel_risco) {
        resultado = resultado.filter(u => u.nivel_risco.toLowerCase() === req.query.nivel_risco.toLowerCase());
    }
    if (req.query.tipo) {
        resultado = resultado.filter(u => u.tipo.toLowerCase() === req.query.tipo.toLowerCase());
    }
    res.json(resultado);
});

app.get("/usos", mostrarUsos)
app.get("/usos/:id", mostrarUsoPorId)
app.post("/usos", novoUso)
app.delete("/usos/:id", excluirUso)
app.put("/usos/:id", alterarUso)

async function buscarUsos() {
    const resposta = await fetch("http://127.0.0.1:3000/usos");
    const dados = await resposta.json();
    console.log(dados);
}

buscarUsos();

const porta = 3000
app.listen(porta, () => {
    console.log(`Servidor rodando em: http://127.0.0.1:${porta}`)
    
})