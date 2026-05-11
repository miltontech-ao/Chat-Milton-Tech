// Menu do restaurante - dono edita aqui
const MENU = {
  1: { nome: 'Frango Grelhado', preco: 2500 },
  2: { nome: 'Pizza Família', preco: 3000 },
  3: { nome: 'Hamburger Completo', preco: 2000 },
  4: { nome: 'Coca 1L', preco: 800 }
};

let pedidosPendentes = {}; // Guarda pedido antes do endereço

socket.on('chat message', ({sala, nome, msg, numero}) => {
    const cmd = msg.toLowerCase();

    // 1. MOSTRA MENU
    if (cmd === '/menu') {
      let textoMenu = '🍽️ *MENU MILTON GRILL* 🍽️\n\n';
      for (let id in MENU) {
        textoMenu += `*${id}* - ${MENU[id].nome} - ${MENU[id].preco} Kz\n`;
      }
      textoMenu += '\nPra pedir: /pedir 1 2 4';
      io.to(sala).emit('bot message', { msg: textoMenu });
      return;
    }

    // 2. FAZ PEDIDO
    if (cmd.startsWith('/pedir')) {
      const itens = cmd.split(' ').slice(1);
      let total = 0;
      let resumo = '';

      itens.forEach(id => {
        if(MENU[id]) {
          total += MENU[id].preco;
          resumo += `• ${MENU[id].nome}\n`;
        }
      });

      if (total === 0) {
        io.to(sala).emit('bot message', { msg: 'Código inválido. Digita /menu pra ver.' });
        return;
      }

      pedidosPendentes[numero] = { nome, itens, total, resumo };
      io.to(sala).emit('bot message', {
        msg: `Pedido anotado ${nome} ✅\n\n${resumo}\n*Total: ${total} Kz*\n\nAgora manda teu *endereço completo* pra entrega:`
      });
      return;
    }

    // 3. RECEBE ENDEREÇO E FINALIZA
    if (pedidosPendentes[numero] &&!cmd.startsWith('/')) {
      const pedido = pedidosPendentes[numero];
      const endereco = msg;

      // Manda pro dono no grupo 'pedidos'
      io.to('pedidos').emit('bot message', {
        msg: `🔔 *NOVO PEDIDO* 🔔\n\n*Cliente:* ${pedido.nome}\n*Número:* +${numero}\n*Pedido:*\n${pedido.resumo}*Total:* ${pedido.total} Kz\n*Endereço:* ${endereco}\n\n*Hora:* ${new Date().toLocaleTimeString('pt-AO')}`
      });

      // Confirma pro cliente
      io.to(sala).emit('bot message', {
        msg: `Boa ${pedido.nome}! Pedido confirmado ✅\nTotal: ${pedido.total} Kz\nVamos entregar em: ${endereco}\n\nTempo: 30-45min`
      });

      delete pedidosPendentes[numero]; // Limpa
      return;
    }

    // Teu código normal continua...
});
