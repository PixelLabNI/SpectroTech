// IMPORTAÇÕES FIREBASE V9
// ==============================================================================
// Importa o serviço Auth e o serviço DB do app.js
import { auth, db, formatDate } from './app.js'; 

// Importa funções modulares de Auth
import { 
    signInWithEmailAndPassword, 
    signOut 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Importa funções modulares de Firestore
import {
    collection,
    query,
    orderBy,
    getDocs,
    doc,
    getDoc,
    updateDoc, // Função modular para update
    deleteDoc, // Função modular para delete
    addDoc // Função modular para add
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
// ==============================================================================


// 1. VARIÁVEIS GLOBAIS E REFERÊNCIAS DOM
// ===================================
const postsCollectionRef = collection(db, 'posts'); // REFERÊNCIA DA COLEÇÃO V9

const postEditor = document.getElementById('post-editor');
const postForm = document.getElementById('post-form');
const postsList = document.getElementById('posts-list');
const newPostBtn = document.getElementById('new-post-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const deletePostBtn = document.getElementById('delete-post-btn');

// Formulário de Login
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');

// Elementos da Dashboard
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const logoutBtn = document.getElementById('logout-btn');
const userEmailSpan = document.getElementById('user-email');
const editorTitle = document.getElementById('editor-title');


// 2. LÓGICA DE AUTENTICAÇÃO
// ===================================

/** Atualiza a interface baseada no estado de autenticação. */
function updateUI(user) {
    if (user) {
        // Logado
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        document.getElementById('auth-info').style.display = 'flex';
        userEmailSpan.textContent = user.email;
        fetchAdminPosts(); // Carrega os posts
    } else {
        // Deslogado
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
        document.getElementById('auth-info').style.display = 'none';
        postsList.innerHTML = ''; // Limpa a lista
        closeEditor(0); 
    }
}

// Observador de estado de autenticação
auth.onAuthStateChanged(updateUI);

// Evento de Login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;
        loginError.textContent = '';
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Erro de Login:", error);
            loginError.textContent = 'Credenciais inválidas. Tente novamente.';
        }
    });
}

// Evento de Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    });
}


// 3. FUNÇÕES DO EDITOR (MODAL)
// ===================================
// ... (sem alterações)

/** Abre o modal de edição para um novo post ou para editar um existente. */
function openEditor(postData = null, postId = null) {
    postForm.reset(); 
    
    if (postId && postData) {
        editorTitle.textContent = 'Editar Post';
        document.getElementById('post-id-hidden').value = postId;
        document.getElementById('post-title').value = postData.title || '';
        document.getElementById('post-snippet').value = postData.snippet || '';
        document.getElementById('post-content').value = postData.content || '';
        document.getElementById('post-thumbnail').value = postData.thumbnail || '';
        document.getElementById('post-youtube').value = postData.youtubeUrl || '';
        
        deletePostBtn.style.display = 'inline-flex'; 
    } else {
        editorTitle.textContent = 'Adicionar Novo Post';
        document.getElementById('post-id-hidden').value = '';
        deletePostBtn.style.display = 'none'; 
    }
    
    postEditor.style.display = 'flex';
    setTimeout(() => postEditor.classList.add('active'), 10); 
}

/** Fecha o modal de edição. */
function closeEditor(delay = 300) {
    postEditor.classList.remove('active');
    setTimeout(() => {
        postEditor.style.display = 'none';
        postForm.reset();
        document.getElementById('post-id-hidden').value = '';
    }, delay);
}

// Eventos do modal
if (newPostBtn) {
    newPostBtn.addEventListener('click', () => openEditor());
}
if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', closeEditor);
}


// 4. FUNÇÕES CRUD (FIREBASE FIRESTORE)
// ===================================

/** Carrega e exibe todos os posts do Firestore. */
async function fetchAdminPosts() {
    if (!auth.currentUser) return; 
    
    postsList.innerHTML = '<p style="text-align: center; padding: 40px 0;">Carregando posts...</p>';

    try {
        // CORRIGIDO: Usa a sintaxe modular V9
        const postsQuery = query(postsCollectionRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(postsQuery);

        if (snapshot.empty) {
            postsList.innerHTML = '<p style="text-align: center; padding: 40px 0;">Ainda não há posts no banco de dados.</p>';
            return;
        }

        let tableHTML = `
            <table class="posts-table">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th class="date-col">Data</th>
                        <th class="action-col">Ação</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        snapshot.forEach(doc => {
            const post = doc.data();
            const dateStr = (typeof formatDate === 'function' && post.timestamp) 
                            ? formatDate(post.timestamp, 'short') 
                            : (post.timestamp ? new Date(post.timestamp.toDate()).toLocaleDateString() : 'Sem Data');
            
            tableHTML += `
                <tr data-id="${doc.id}">
                    <td data-label="Título">${post.title}</td>
                    <td data-label="Data" class="date-col">${dateStr}</td>
                    <td data-label="Ação" class="action-col">
                        <button class="btn btn-primary btn-edit btn-icon-only" data-id="${doc.id}" aria-label="Editar ${post.title}">
                            <i data-feather="edit-3"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        postsList.innerHTML = tableHTML;
        
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation(); 
                const postId = e.currentTarget.getAttribute('data-id');
                // CORRIGIDO: Usa a sintaxe modular V9 para obter o documento
                const postDocRef = doc(db, 'posts', postId);
                const docSnap = await getDoc(postDocRef);
                
                if (docSnap.exists()) {
                     openEditor(docSnap.data(), postId);
                } else {
                    alert('Erro: Post não encontrado.');
                }
            });
        });
        
        document.querySelectorAll('.posts-table tbody tr').forEach(row => {
            row.addEventListener('click', (e) => {
                row.querySelector('.btn-edit').click();
            });
        });

        feather.replace(); 

    } catch (error) {
        console.error("Erro ao carregar posts para o admin:", error);
        postsList.innerHTML = '<p style="text-align: center; padding: 40px 0; color: var(--danger-color);">Erro ao carregar a lista de posts. Verifique suas regras do Firestore.</p>';
    }
}


// Evento de Submissão do Formulário (Salvar/Atualizar)
if (postForm) {
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const postId = document.getElementById('post-id-hidden').value;
        const savePostBtn = document.getElementById('save-post-btn');
        const originalText = savePostBtn.textContent;
        
        savePostBtn.textContent = postId ? 'Atualizando...' : 'Criando...';
        savePostBtn.disabled = true;

        const postData = {
            title: document.getElementById('post-title').value,
            snippet: document.getElementById('post-snippet').value,
            content: document.getElementById('post-content').value,
            thumbnail: document.getElementById('post-thumbnail').value || null,
            youtubeUrl: document.getElementById('post-youtube').value || null,
            // Acesso a 'firebase' está disponível via script compat no HTML
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            // CORRIGIDO: Usa a sintaxe modular V9
            if (postId) {
                const postDocRef = doc(db, 'posts', postId);
                await updateDoc(postDocRef, postData);
                alert('Post atualizado com sucesso!');
            } else {
                await addDoc(postsCollectionRef, postData);
                alert('Novo post criado com sucesso!');
            }
            
            closeEditor();
            fetchAdminPosts(); 
            
        } catch (error) {
            console.error("Erro ao salvar o post:", error);
            alert('Erro ao salvar o post. Verifique o console.');
        } finally {
            savePostBtn.textContent = originalText;
            savePostBtn.disabled = false;
        }
    });
}

// Evento para Excluir Post
if (deletePostBtn) {
    deletePostBtn.addEventListener('click', async () => {
        const postId = document.getElementById('post-id-hidden').value;
        if (!postId) return;

        if (confirm('Tem certeza de que deseja EXCLUIR este post permanentemente?')) {
            try {
                // CORRIGIDO: Usa a sintaxe modular V9
                const postDocRef = doc(db, 'posts', postId);
                await deleteDoc(postDocRef);
                alert('Post excluído com sucesso!');
                
                closeEditor();
                fetchAdminPosts(); 
            } catch (error) {
                console.error("Erro ao excluir o post:", error);
                alert('Erro ao excluir o post. Tente novamente.');
            }
        }
    });
}