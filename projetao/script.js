const API_URL = 'http://192.168.1.110:8000';

function showMessage(message, isError = false) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${isError ? 'error' : 'success'}`;
    messageDiv.classList.remove('hidden');
}

function hideMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.classList.add('hidden');
}

async function sendOTP() {
    const email = document.getElementById('email').value;
    
    if (!email) {
        showMessage('Por favor, insira um email válido', true);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('OTP enviado com sucesso!');
            document.getElementById('emailForm').classList.add('hidden');
            document.getElementById('otpForm').classList.remove('hidden');
        } else {
            showMessage(data.detail || 'Erro ao enviar OTP', true);
        }
    } catch (error) {
        showMessage('Erro ao conectar com o servidor', true);
    }
}

async function verifyOTP() {
    const email = document.getElementById('email').value;
    const otp = document.getElementById('otp').value;

    if (!otp) {
        showMessage('Por favor, insira o código OTP', true);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp }),
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Login realizado com sucesso!');
            // Aqui você pode redirecionar para a página principal ou fazer outras ações após o login
            setTimeout(() => {
                window.location.href = '/dashboard.html'; // Substitua pela sua página principal
            }, 2000);
        } else {
            showMessage(data.detail || 'OTP inválido', true);
        }
    } catch (error) {
        showMessage('Erro ao conectar com o servidor', true);
    }
}

// Adiciona validação de email em tempo real
document.getElementById('email').addEventListener('input', function(e) {
    const email = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        e.target.setCustomValidity('Por favor, insira um email válido');
    } else {
        e.target.setCustomValidity('');
    }
}); 