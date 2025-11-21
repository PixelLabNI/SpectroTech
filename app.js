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
    where 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// NOTA DE SEGURANÇA: Em produção, configure as Security Rules do Firestore 
// para permitir leitura pública apenas em documentos 'published: true'.
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

console.log("SpectroTech Core Initialized.");

// Helper: Formata Data (MOVIDO PARA CIMA E EXPORTADO)
export function formatDate(timestamp, formatType = 'full') {
    if (!timestamp?.toDate) return "";
    
    const options = formatType === 'short' 
        ? { day: 'numeric', month: 'short', year: 'numeric' }
        : { day: 'numeric', month: 'short', year: 'numeric' };

    return timestamp.toDate().toLocaleDateString('pt-br', options);
}

// EXPORTAÇÕES PRINCIPAIS PARA USO EM OUTROS MÓDULOS (e.g., admin.js)
// =================================================================
export { db, auth, getFirestore, getAuth, collection, getDocs, getDoc, doc, query, orderBy, limit, where };


// ===================================
// 2. UI & THEME LOGIC
// ===================================
const body = document.body;
const themeToggle = document.getElementById('theme-toggle');

// Aplica tema sem piscar
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
if (initialTheme === 'dark') body.classList.add('dark-mode');

if (themeToggle) { 
    themeToggle.addEventListener('click', () => {
        const isDark = body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// --- Header Scroll Effect ---
const header = document.querySelector('header');
if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
}

// --- Mobile Menu System ---
const menuToggle = document.getElementById('mobile-menu-toggle');
const mainNav = document.getElementById('main-nav');
const menuOverlay = document.querySelector('.menu-overlay');

if (menuToggle && mainNav) {
    const toggleMenu = (forceClose = false) => {
        const isActive = forceClose ? false : !mainNav.classList.contains('active');
        mainNav.classList.toggle('active', isActive);
        menuToggle.classList.toggle('active', isActive);
        menuOverlay?.classList.toggle('active', isActive);
        body.classList.toggle('no-scroll', isActive);
        menuToggle.setAttribute('aria-expanded', isActive);
    };

    menuToggle.addEventListener('click', () => toggleMenu());
    menuOverlay?.addEventListener('click', () => toggleMenu(true));

    // Fecha ao clicar em links internos
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.includes('#')) {
                // Delay para scroll suave acontecer após fechar
                setTimeout(() => toggleMenu(true), 100);
            } else {
                toggleMenu(true);
            }
        });
    });
}

// --- Back to Top ---
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) backToTopBtn.classList.add('visible');
        else backToTopBtn.classList.remove('visible');
    }, { passive: true });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// --- Cookie Consent ---
const cookieBanner = document.getElementById('cookie-consent-banner');
if (cookieBanner) {
    const consent = localStorage.getItem('cookie_consent');
    
    const setConsent = (status) => {
        localStorage.setItem('cookie_consent', status);
        cookieBanner.classList.remove('visible');
        if (typeof gtag === 'function') {
            gtag('consent', 'update', { 
                'analytics_storage': status === 'accepted' ? 'granted' : 'denied' 
            });
        }
    };

    if (!consent) {
        setTimeout(() => cookieBanner.classList.add('visible'), 1500);
    } else if (consent === 'accepted') {
        setConsent('accepted');
    }

    document.getElementById('cookie-accept')?.addEventListener('click', () => setConsent('accepted'));
    document.getElementById('cookie-reject')?.addEventListener('click', () => setConsent('rejected'));
}


// ===================================
// 3. CONTENT LOGIC (BLOG)
// ===================================
let allPosts = []; 
const postsContainer = document.getElementById('posts-container');
const searchInputEl = document.getElementById('search-input');
const categoryFilterEl = document.getElementById('category-filter');

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se estamos na página correta pela URL, não apenas pelo ID
    const isPostPage = window.location.pathname.includes('post.html');

    if (postsContainer) {
        fetchBlogPosts();
        setupFilters();
    } else if (document.getElementById('post-content') && isPostPage) { 
        // Só executa se tiver o elemento E estiver na página post.html
        fetchSinglePost();
    }
});

// Helper: Tempo de Leitura (Novo)
function calculateReadingTime(text) {
    const wpm = 200;
    const words = text ? text.trim().split(/\s+/).length : 0;
    const time = Math.ceil(words / wpm);
    return `${time} min de leitura`;
}

// Helper: Debounce para busca (Performance)
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// --- Filter System ---
function setupFilters() {
    if (searchInputEl) {
        searchInputEl.addEventListener('input', debounce(filterAndDisplayPosts, 300));
    }
    if (categoryFilterEl) {
        categoryFilterEl.addEventListener('change', filterAndDisplayPosts);
    }
}

function populateCategoryFilter() {
    if (!categoryFilterEl) return;
    const categories = new Set(allPosts.map(p => p.data.category).filter(Boolean));
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilterEl.appendChild(option);
    });
}

function filterAndDisplayPosts() {
    const term = searchInputEl?.value.toLowerCase().trim() || '';
    const category = categoryFilterEl?.value || 'all';

    const filtered = allPosts.filter(post => {
        const d = post.data;
        const matchesCategory = category === 'all' || d.category === category;
        const matchesSearch = !term || 
            d.title.toLowerCase().includes(term) || 
            d.snippet.toLowerCase().includes(term) ||
            (d.tags || []).some(t => t.toLowerCase().includes(term));
        
        return matchesCategory && matchesSearch;
    });

    displayPosts(filtered);
}

function displayPosts(posts) {
    if (!postsContainer) return;
    
    const isHome = postsContainer.getAttribute('data-homepage') === 'true';
    const limitCount = isHome ? 3 : posts.length;
    const displayList = posts.slice(0, limitCount);

    postsContainer.innerHTML = '';

    if (displayList.length === 0) {
        postsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
                <p style="color: var(--text-muted); font-size: 1.1rem;">Nenhum post encontrado.</p>
            </div>`;
        return;
    }

    const fragment = document.createDocumentFragment();

    displayList.forEach(postDoc => {
        const post = postDoc.data;
        const readTime = calculateReadingTime(post.content || '');
        
        const article = document.createElement('article');
        article.className = 'post-card';
        
        article.innerHTML = `
            <a href="post.html?id=${postDoc.id}" class="post-card-image-wrapper" aria-label="Ler ${post.title}">
                <img src="${post.thumbnail || 'https://via.placeholder.com/400x225?text=SpectroTech'}" 
                     alt="${post.title}" class="post-card-image" loading="lazy">
            </a>
            <div class="post-card-content">
                <div class="post-meta-header">
                    <span class="post-category">${post.category || 'Geral'}</span>
                    <span class="post-reading-time"><i data-feather="clock" style="width:12px;"></i> ${readTime}</span>
                </div>
                <a href="post.html?id=${postDoc.id}">
                    <h4>${post.title}</h4>
                </a>
                <p>${post.snippet}</p>
                <div style="margin-top: auto; padding-top: 15px;">
                    <a href="post.html?id=${postDoc.id}" class="read-more-link" style="font-weight:600; font-size: 0.9rem;">Ler artigo completo &rarr;</a>
                </div>
            </div>
        `;
        fragment.appendChild(article);
    });

    postsContainer.appendChild(fragment);
    if (typeof feather !== 'undefined') feather.replace();
}

// --- Fetch Functions ---
async function fetchBlogPosts() {
    const isHome = postsContainer.getAttribute('data-homepage') === 'true';
    
    try {
        // Busca otimizada: Publicados e Ordenados
        const q = query(
            collection(db, 'posts'),
            where('published', '==', true),
            orderBy('timestamp', 'desc')
            // Se fosse paginação real, usaria limit() aqui, mas como filtramos no client...
        );

        const snapshot = await getDocs(q);
        
        allPosts = snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
        
        if (!isHome) populateCategoryFilter();
        filterAndDisplayPosts(); // Render inicial

    } catch (error) {
        console.error("Error fetching posts:", error);
        postsContainer.innerHTML = '<p style="text-align:center">Erro ao carregar posts.</p>';
    }
}

async function fetchSinglePost() {
    const contentEl = document.getElementById('post-content');
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        window.location.href = 'posts.html'; // Redireciona se sem ID
        return;
    }

    try {
        const docSnap = await getDoc(doc(db, 'posts', id));
        
        if (!docSnap.exists() || docSnap.data().published === false) {
            contentEl.innerHTML = `
                <div style="text-align: center; padding: 60px;">
                    <h2>Post não encontrado</h2>
                    <p>O conteúdo que você procura não existe ou foi removido.</p>
                    <a href="posts.html" class="cta-button" style="margin-top:20px">Voltar ao Blog</a>
                </div>`;
            contentEl.removeAttribute('aria-busy');
            return;
        }

        const post = docSnap.data();
        
        // SEO Update
        document.title = `${post.title} | SpectroTech`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if(metaDesc) metaDesc.content = post.snippet;

        // Render
        const date = formatDate(post.timestamp);
        const readTime = calculateReadingTime(post.content);
        const tagsHtml = (post.tags || []).map(t => `<span class="tag">${t}</span>`).join(' ');

        let html = `
            <h2>${post.title}</h2>
            
            <div class="post-meta-full">
                <span style="color: var(--primary-color); font-weight: 700;">${post.category || 'Artigo'}</span>
                <span>&bull;</span>
                <span>${date}</span>
                <span>&bull;</span>
                <span>${readTime}</span>
            </div>

            <div class="post-body">
                ${post.content}
            </div>
            
            <div style="margin-top: 40px; display: flex; gap: 10px; flex-wrap: wrap;">
                ${tagsHtml}
            </div>
        `;

        if (post.youtubeUrl?.includes('embed')) {
            html += `
                <div class="video-container">
                    <iframe src="${post.youtubeUrl}" allowfullscreen></iframe>
                </div>
            `;
        }

        html += `
            <div class="post-footer-cta" style="margin-top: 60px; padding: 40px; background: var(--bg-body); border-radius: 16px; text-align: center;">
                <h4 style="margin-bottom: 15px;">Gostou deste conteúdo?</h4>
                <p style="margin-bottom: 25px; color: var(--text-muted);">Explore mais sobre tecnologia em nossa central de artigos.</p>
                <a href="posts.html" class="cta-button">Ver Mais Artigos</a>
            </div>
        `;

        contentEl.innerHTML = html;
        contentEl.removeAttribute('aria-busy');
        if (typeof feather !== 'undefined') feather.replace();

    } catch (error) {
        console.error(error);
        contentEl.innerHTML = '<p style="text-align:center">Erro ao carregar conteúdo.</p>';
    }
}

// --- Smart Back Button ---
const backBtn = document.getElementById('back-button');
if (backBtn) {
    backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Se o histórico tiver entradas e a origem for interna, volta. Senão, vai pra lista.
        if (window.history.length > 1 && document.referrer.includes(window.location.hostname)) {
            window.history.back();
        } else {
            window.location.href = 'posts.html';
        }
    });
}