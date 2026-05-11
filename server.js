const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let usuariosOnline = {};

io.on('connection', (socket) => {
    console.log('Usuário conectou');

    socket.on('entrar', (nome) => {
        usuariosOnline[socket.id] = { nome, id: socket.id };
        socket.broadcast.emit('mensagem', {
            nome: 'Sistema',
            texto: `${nome} entrou no chat`,
            hora: horaAtual()
        });
        io.emit('listaOnline', Object.values(usuariosOnline));
    });

    socket.on('mensagem', (dados) => {
        io.emit('mensagem', {
            nome: dados.nome,
            texto: dados.texto,
            hora: horaAtual()
        });
    });

    socket.on('digitando', (nome) => {
        socket.broadcast.emit('digitando', nome);
    });

    socket.on('disconnect', () => {
        if (usuariosOnline[socket.id]) {
            const nome = usuariosOnline[socket.id].nome;
            delete usuariosOnline[socket.id];
            io.emit('mensagem', {
                nome: 'Sistema',
                texto: `${nome} saiu`,
                hora: horaAtual()
            });
            io.emit('listaOnline', Object.values(usuariosOnline));
        }
    });
});

function horaAtual() {
    return new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Milton Chat rodando na porta ${PORT}`);
});
