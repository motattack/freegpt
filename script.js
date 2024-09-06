document.addEventListener('DOMContentLoaded', async () => {
    let token = '';

    try {
        const tokenResponse = await fetch('https://cors-anywhere.herokuapp.com/https://chatgpt-au.vulcanlabs.co/api/v1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-agent': 'Chat Smith Android, Version 3.8.3(637)',
                'accept': 'application/json',
            },
            body: JSON.stringify({
                device_id: "57C8AC7D51346473",
                order_id: "",
                product_id: "",
                purchase_token: "",
                subscription_id: ""
            })
        });

        const tokenData = await tokenResponse.json();
        token = tokenData.AccessToken;
    } catch (error) {
        console.error('Ошибка при получении токена:', error);
        alert('Не удалось загрузить токен. Попробуйте обновить страницу.');
    }

    document.querySelector('.msger-send-btn').addEventListener('click', async function (e) {
        e.preventDefault();

        const systemContent = document.querySelector('#system').value;
        const userContent = document.querySelector('#user').value;

        if (!systemContent || !userContent) {
            alert('Пожалуйста, заполните оба поля!');
            return;
        }

        addMessage('right-msg', userContent);

        try {
            const chatResponse = await fetch('https://cors-anywhere.herokuapp.com/https://prod-smith.vulcanlabs.co/api/v7/chat_android', {
                method: 'POST',
                headers: {
                    'authorization': `Bearer ${token}`,
                    'accept': 'application/json',
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': 'Chat Smith Android, Version 3.8.3(637)',
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    user: '1',
                    messages: [
                        { role: 'system', content: systemContent },
                        { role: 'user', content: userContent }
                    ],
                    nsfw_check: false
                })
            });

            const chatData = await chatResponse.json();

            if (chatData.choices && chatData.choices[0] && chatData.choices[0].Message) {
                const markdownContent = chatData.choices[0].Message.content;
                addMessage('left-msg', marked.parse(markdownContent));
            } else {
                console.error('Неожиданная структура ответа:', chatData);
                addMessage('left-msg', 'Неожиданный ответ от сервера.');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('left-msg', 'Произошла ошибка. Попробуйте еще раз позже.');
        }
    });

    function addMessage(position, content) {
        const chatBox = document.querySelector('.msger-chat');
        const messageElement = document.createElement('div');
        messageElement.classList.add('msg', position);
        messageElement.innerHTML = `
            <div class="msg-bubble">
                <div class="msg-info">
                    <div class="msg-info-name">${position === 'right-msg' ? 'You' : 'BOT'}</div>
                    <div class="msg-info-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div class="msg-text">${content}</div>
            </div>
        `;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});