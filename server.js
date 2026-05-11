const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;
const SENHA_DO_CHAT = "milton2026"; // TROCA AQUI TUA SENHA

// Tela de senha antes de entrar no chat
app.use((req, res, next) => {
  const senha = req.query.senha;
  
  // Se já tá no chat ou é arquivo do socket, deixa passar
  if (req.path.includes('socket.io') || senha === SENHA_DO_CHAT) {
    return next();
  }
  
  // Senão mostra tela de login
  return res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Milton Chat Privado</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: Arial; 
          background: #e5ddd5; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          margin: 0;
        }
        .login { 
          background: white; 
          padding: 30px; 
          border-radius: 8px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
        }
        input { 
          padding: 12px; 
          width: 200px; 
          border: 1px solid #ddd; 
          border-radius: 20px;
          margin: 10px 0;
        }
        button { 
          padding: 12px 24px; 
          background: #25D366; 
          color: white; 
          border: none; 
          border-radius: 20px; 
          cursor: pointer;
          font-weight: bold;
        }
        h2 { color: #075E54; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="login">
        <h2>💚 Milton Chat</h2>
        <p>Chat privado do Milton</p>
        <form>
          <input name="senha" type="password" placeholder="Digite a senha" required>
          <br>
          <button type="submit">Entrar</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// Serve o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Lógica do Socket.io
io.on('connection', (socket) => {
  console.log('Usuário conectado');
  
  socket.on('chat message', (data) => {
    io.emit('chat message', data); // Manda pra todo mundo
  });
  
  socket.on('disconnect', () => {
    console.log('Usuário saiu');
  });
});

http.listen(PORT, () => {
  console.log(`HELLO, WORLD! Chat Milton Tech is live on ${PORT}`);
});
