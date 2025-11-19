// ===================================
// 1. CONFIGURAÇÃO DO FIREBASE (V9 MODULAR)
// ===================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    getDoc, 
    doc, 
    query, 
    orderBy,
    limit,
    where // IMPORTADO: Necessário para filtrar o status de publicação
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyC3E77YNxUs2sm35xOXwz01EVB-g9CyQNM",
    authDomain: "portal-spectrotech.firebaseapp.com",
    projectId: "portal-spectrotech",
    storageBucket: "portal-spectrotech.firebasestorage.app",
    messagingSenderId: "1053602493345",
    appId: "1:1053602493345:web:4cc343601579f8a5f0d1e0",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 

console.log("Firebase App e Firestore (v9) inicializados.");


// ===================================
// 2. LÓGICA DO DARK MODE (UI/UX)
// ===================================
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

function applyTheme(theme) {
    if (theme === 'dark') {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
}

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme) {
    applyTheme(savedTheme);
} else {
    applyTheme(prefersDark ? 'dark' : 'light');
}

if (themeToggle) { 
    themeToggle.addEventListener('click', () => {
        const isDark = body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// ===================================
// 2.1 APRIMORAMENTO: LÓGICA DA UI GERAL (MENU, SCROLL, ETC.)
// ===================================

const header = document.querySelector('header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// --- Lógica do Menu Mobile ---
const menuToggle = document.getElementById('mobile-menu-toggle');
const mainNav = document.getElementById('main-nav');
const menuOverlay = document.querySelector('.menu-overlay'); // ADICIONADO

if (menuToggle && mainNav) {
    // Evento para abrir/fechar o menu
    menuToggle.addEventListener('click', () => {
        const isActive = mainNav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isActive);
        body.classList.toggle('no-scroll', isActive); 
        if (menuOverlay) menuOverlay.classList.toggle('active', isActive); // ALTERADO
    });

    // --- APRIMORAMENTO: Fechar menu ao clicar no link ---
    const navLinks = mainNav.querySelectorAll('a');

    // Função para fechar o menu
    const closeMenu = () => {
        mainNav.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        body.classList.remove('no-scroll');
        if (menuOverlay) menuOverlay.classList.remove('active'); // ALTERADO
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Só executa se o menu estiver ativo
            if (!mainNav.classList.contains('active')) {
                return;
            }

            const href = link.getAttribute('href');
            
            // Verifica se é um link de âncora NA MESMA PÁGINA
            const isSamePageAnchor = (
                href.startsWith('#') || 
                (href.startsWith('index.html#') && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/'))
            ) && href.length > 1;


            if (isSamePageAnchor) {
                e.preventDefault(); 
                closeMenu();     

                setTimeout(() => {
                    const targetId = href.split('#')[1];
                    if (targetId) {
                        const targetElement = document.getElementById(targetId);
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                }, 300); 
            } else {
                closeMenu();
            }
        });
    });

    // ADICIONADO: Fechar menu ao clicar no overlay
    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMenu);
    }
}

// --- Botão "Voltar ao Topo" ---
const backToTopButton = document.getElementById('back-to-top');
if (backToTopButton) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===================================
// 2.2 LÓGICA DE CONSENTIMENTO DE COOKIES (LGPD/GDPR) (NOVO)
// ===================================
const cookieBanner = document.getElementById('cookie-consent-banner');
const acceptButton = document.getElementById('cookie-accept');
const rejectButton = document.getElementById('cookie-reject');

if (cookieBanner && acceptButton && rejectButton) {
    const consent = localStorage.getItem('cookie_consent');

    const grantConsent = () => {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', { 'analytics_storage': 'granted' });
        }
        console.log("Cookie consent granted.");
    };

    const denyConsent = () => {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', { 'analytics_storage': 'denied' });
        }
        console.log("Cookie consent denied.");
    };

    if (consent === 'accepted') {
        // Se já aceitou, atualiza o consentimento do gtag
        grantConsent();
    } else if (consent === 'rejected') {
        // Se já rejeitou, garante que o consentimento seja 'negado'
        denyConsent();
    } else {
        // Se não há escolha, mostra o banner
        cookieBanner.classList.add('visible');
    }

    // Evento ao clicar em "Aceitar"
    acceptButton.addEventListener('click', () => {
        localStorage.setItem('cookie_consent', 'accepted');
        cookieBanner.classList.remove('visible');
        grantConsent();
    });

    // Evento ao clicar em "Rejeitar"
    rejectButton.addEventListener('click', () => {
        localStorage.setItem('cookie_consent', 'rejected');
        cookieBanner.classList.remove('visible');
        denyConsent();
    });
}


// ===================================
// 3. VARIÁVEL GLOBAL E DETECÇÃO DE PÁGINA
// ===================================
let allPosts = []; 
let categoryFilterEl = null; // NOVO
let searchInputEl = null; // NOVO

document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.getElementById('posts-container');
    const postContent = document.getElementById('post-content');
    
    // ATUALIZADO: Salva referências globais
    searchInputEl = document.getElementById('search-input'); 
    categoryFilterEl = document.getElementById('category-filter'); // NOVO

    if (postsContainer) {
        fetchBlogPosts();
        
        // ATUALIZADO: Usa a nova função de filtro
        if (searchInputEl) {
            searchInputEl.addEventListener('input', filterAndDisplayPosts); 
        }
        // NOVO: Listener para o filtro de categoria
        if (categoryFilterEl) { 
            categoryFilterEl.addEventListener('change', filterAndDisplayPosts); 
        }

    } else if (postContent) {
        fetchSinglePost();
    }
});


// ===================================
// 4. FUNÇÃO HELPER (AUXILIAR)
// ===================================
function formatDate(timestamp, style = 'long') {
    if (!timestamp || !timestamp.toDate) {
        return "Data indisponível";
    }
    const date = timestamp.toDate();
    
    let options = {};
    if (style === 'short') {
        options = {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        };
    } else { // 'long'
        options = {
            day: 'numeric',
            month: 'long', 
            year: 'numeric'
        };
    }

    return date.toLocaleDateString('pt-br', options);
}

// ===================================
// 4.1 LÓGICA DE BUSCA E FILTRAGEM
// ===================================

// NOVO: Função para popular o filtro de categoria
function populateCategoryFilter() {
    if (!categoryFilterEl) return;

    // Cria um Set (lista de itens únicos) com as categorias, filtrando valores vazios
    const categories = new Set(allPosts.map(post => post.data.category).filter(Boolean));
    
    const fragment = document.createDocumentFragment();
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        fragment.appendChild(option);
    });
    
    // Adiciona as novas <option> ao <select>
    categoryFilterEl.appendChild(fragment);
}

// NOVO: Função centralizada que filtra por Categoria E Busca
function filterAndDisplayPosts() {
    // Pega os valores atuais dos filtros
    const searchTerm = searchInputEl ? searchInputEl.value.toLowerCase().trim() : '';
    const selectedCategory = categoryFilterEl ? categoryFilterEl.value : 'all';

    let filteredPosts = allPosts;

    // 1. Filtro por Categoria
    if (selectedCategory !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.data.category === selectedCategory);
    }

    // 2. Filtro por Busca (título, snippet, tags E categoria)
    if (searchTerm) {
        filteredPosts = filteredPosts.filter(post => {
            const title = post.data.title.toLowerCase();
            const snippet = post.data.snippet.toLowerCase();
            const tags = (post.data.tags || []).join(' ').toLowerCase();
            const category = (post.data.category || '').toLowerCase(); // Inclui categoria na busca
            
            return title.includes(searchTerm) || 
                       snippet.includes(searchTerm) || 
                       tags.includes(searchTerm) ||
                       category.includes(searchTerm);
        });
    }

    // 3. Exibe os posts filtrados
    displayPosts(filteredPosts);
}


// ===================================
// 4.2 RENDERIZADOR DE POSTS (COM OTIMIZAÇÃO DE DOM E LÓGICA DE LIMITE)
// ===================================
function displayPosts(posts) {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;

    // Detecta se é a página inicial
    const isHomePage = postsContainer.getAttribute('data-homepage') === 'true'; 

    const fragment = document.createDocumentFragment();
    postsContainer.innerHTML = '';

    if (posts.length === 0) {
        postsContainer.innerHTML = '<p style="text-align: center; padding: 40px 0;">Nenhum post encontrado.</p>';
        return;
    }

    // ✅ GARANTIA DE RENDERIZAÇÃO: Aplica slice(0, 3) APENAS na Home
    // Isso limita a renderização mesmo que a query do Firestore tenha sido burlada 
    const postsToDisplay = isHomePage ? posts.slice(0, 3) : posts; 

    postsToDisplay.forEach((postDoc, i) => { 
        const post = postDoc.data; 
        const postId = postDoc.id; 

        // NOVO: Pega a categoria
        const category = post.category || 'Geral';

        const thumbnailUrl = post.thumbnail || 'https://via.placeholder.com/400x200.png?text=spectrotech';
        const placeholderClass = post.thumbnail ? '' : 'placeholder';

        const tags = post.tags || [];
        let tagsHTML = '';
        if (tags.length > 0) {
            tagsHTML = `
                <div class="post-card-tags">
                    ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            `;
        }

        const postCard = document.createElement('article');
        postCard.classList.add('post-card');

        postCard.innerHTML = `
            <a href="post.html?id=${postId}" aria-label="Ler o post ${post.title}">
                <img src="${thumbnailUrl}" 
                    alt="Miniatura do post ${post.title}" 
                    class="post-card-image ${placeholderClass}" 
                    loading="lazy"
                    width="400" 
                    height="200">
            </a>
            <div class="post-card-content">
                <span class="post-card-category">${category}</span> 
            
                <span class="post-card-date">${formatDate(post.timestamp, 'short')}</span> 
                ${tagsHTML}
                <a href="post.html?id=${postId}">
                    <h4>${post.title}</h4>
                </a>
                <p>${post.snippet}</p>
                <a href="post.html?id=${postId}" class="read-more">Ler Postagem</a>
            </div>
        `;
        fragment.appendChild(postCard); 
    });
    
    postsContainer.appendChild(fragment);
}


// ===================================
// 5. FUNÇÃO PARA A PÁGINA INICIAL (index.html)
// ===================================
async function fetchBlogPosts() {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;

    // Detecta se é a página inicial (baseado no atributo em index.html)
    const isHomePage = postsContainer.getAttribute('data-homepage') === 'true';

    try {
        const postsCollection = collection(db, 'posts');
        
        let q; 
        
        // NOVO: Adiciona a condição de filtro 'published == true' à consulta base
        const baseQuery = [where('published', '==', true), orderBy('timestamp', 'desc')];
        
        if (isHomePage) {
            // ✅ FILTRO APLICADO: Filtra por publicado E limita a 3 posts na Home
            q = query(postsCollection, ...baseQuery, limit(3)); 
        } else {
            // Em outras páginas (como posts.html), busca todos publicados
            q = query(postsCollection, ...baseQuery);
        }

        const snapshot = await getDocs(q); 

        if (snapshot.empty) {
            postsContainer.innerHTML = '<p style="text-align: center; padding: 40px 0;">Ainda não há tutoriais por aqui. Volte em breve!</p>';
            return;
        }

        allPosts = snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
        }));

        // NOVO: Se estiver na página de posts (não-home), popula o filtro
        if (!isHomePage) {
            populateCategoryFilter();
        }

        // ATUALIZADO: Chama a nova função de filtro para a exibição inicial
        filterAndDisplayPosts(); 

    } catch (error) {
        console.error("Erro ao buscar posts:", error);
        postsContainer.innerHTML = '<p style="text-align: center; padding: 40px 0;">Erro ao carregar as postagens. Tente novamente mais tarde.</p>';
    }
}


// ===================================
// 6. FUNÇÃO PARA A PÁGINA DE POST (post.html)
// ===================================
async function fetchSinglePost() {
    const postContent = document.getElementById('post-content');
    const postLoader = document.getElementById('post-loader'); 

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        postContent.innerHTML = '<h2 style="text-align: center; padding: 40px 0;">Post não encontrado</h2><p style="text-align: center;"><a href="index.html">Voltar ao início</a>.</p>';
        return;
    }
    
    postContent.setAttribute('aria-busy', 'true');

    try {
        const docRef = doc(db, 'posts', postId);
        const docSnap = await getDoc(docRef); 

        if (docSnap.exists()) {
            const post = docSnap.data(); 

            // NOVO: Verifica se o post está explicitamente desativado (published: false)
            if (post.published === false) {
                 postContent.setAttribute('aria-busy', 'false');
                 console.error("Post não publicado:", postId);
                 postContent.innerHTML = '<h2 style="text-align: center; padding: 40px 0;">Post não encontrado</h2><p style="text-align: center;">Não foi possível encontrar este tutorial. <a href="index.html">Voltar ao início</a>.</p>';
                 return; // Sai da função se for rascunho
            }
            
            // ✅ ATUALIZAÇÃO DE SEO E CORREÇÃO:
            // 1. Corrige o título para usar o nome do site (SpectroTech)
            // 2. Atualiza a meta description para o snippet do post
            
            document.title = `${post.title} | SpectroTech`;

            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', post.snippet);
            } else {
                // Fallback caso a tag não exista no HTML (embora tenhamos adicionado)
                const newMetaDesc = document.createElement('meta');
                newMetaDesc.setAttribute('name', 'description');
                newMetaDesc.setAttribute('content', post.snippet);
                document.head.appendChild(newMetaDesc);
            }
            // Fim da atualização de SEO

            if (postLoader) postLoader.remove();
            
            const titlePlaceholder = document.getElementById('post-title-placeholder');
            const bodyPlaceholder = document.getElementById('post-body-placeholder');
            if (titlePlaceholder) titlePlaceholder.remove();
            if (bodyPlaceholder) bodyPlaceholder.remove();

            postContent.setAttribute('aria-busy', 'false');

            // NOVO: Pega a categoria
            const category = post.category || 'Geral';

            const tags = post.tags || [];
            let tagsHTML = '';
            if (tags.length > 0) {
                tagsHTML = `
                    <div class="post-tags">
                        ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                `;
            }

            let postHTML = `
                <h2>${post.title}</h2>
                <div class="post-meta">
                    <span class="post-meta-category">${category}</span>
                    <span class="post-meta-separator">|</span>
                
                    Publicado em ${formatDate(post.timestamp, 'long')} por Mateus Calixto
                </div>
                ${tagsHTML}
                <div class="post-body">
                    ${post.content} 
                </div>
            `;
            
            if (post.youtubeUrl && post.youtubeUrl.includes('embed')) {
                postHTML += `
                    <h3>Conteúdo em Vídeo</h3>
                    <div class="video-container">
                        <iframe src="${post.youtubeUrl}" 
                            title="${post.title} (Vídeo do YouTube)"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                            loading="lazy">
                        </iframe>
                    </div>
                `;
            }

            postHTML += `
                <div class="post-footer-cta">
                    <p>Gostou? <a href="posts.html">Veja mais posts</a> ou</p>
                    <a href="https://github.com/PixelLabNI/SpectroTech" target="_blank" class="cta-button">Saiba Sobre a SpectroTech</a>
                </div>
            `;

            postContent.innerHTML = postHTML;
            
            if (typeof feather !== 'undefined' && feather.replace) {
                 feather.replace(); 
            }


        } else {
            postContent.setAttribute('aria-busy', 'false');
            console.error("Nenhum post encontrado com este ID:", postId);
            postContent.innerHTML = '<h2 style="text-align: center; padding: 40px 0;">Post não encontrado</h2><p style="text-align: center;">Não foi possível encontrar este tutorial. <a href="index.html">Voltar ao início</a>.</p>';
        }
    } catch (error) {
        postContent.setAttribute('aria-busy', 'false');
        console.error("Erro ao buscar o post:", error);
        postContent.innerHTML = '<h2 style="text-align: center; padding: 40px 0;">Erro</h2><p style="text-align: center;">Ocorreu um erro ao carregar o post. Tente novamente.</p>';
    }
}

// --- Lógica para o botão "Voltar" na post.html ---
const backButton = document.getElementById('back-button');

if (backButton) {
    backButton.addEventListener('click', (e) => {
        e.preventDefault(); 
        window.history.back(); 
    });
}

// NOVO: Exporta as variáveis para serem usadas pelo admin.js
export { db, auth, formatDate };