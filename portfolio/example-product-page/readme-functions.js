async function loadReadme() {
    try {
        const response = await fetch('README.md');
        if (!response.ok) {
            throw new Error('Failed to load README');
        }
        const markdown = await response.text();
        const html = convertMarkdownToHtml(markdown);
        readmeBody.innerHTML = html;
    } catch (error) {
        console.error('Error loading README:', error);
        readmeBody.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--gray-500);"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; opacity: 0.3;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><p style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Failed to load README</p><small>Please try again later</small></div>';
    }
}

function convertMarkdownToHtml(markdown) {
    let html = markdown;
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0;">');
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.+<\/li>)/s, '<ul>$1</ul>');
    html = html.replace(/✅/g, '<span style="color: var(--success);">✅</span>');
    const lines = html.split('\n\n');
    html = lines.map(line => {
        line = line.trim();
        if (line.startsWith('<h') || line.startsWith('<ul') || line.startsWith('<pre') || line.startsWith('<img')) return line;
        return line ? `<p>${line.replace(/\n/g, '<br>')}</p>` : '';
    }).join('');
    return html;
}

function openReadme() {
    readmeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    loadReadme();
}

function closeReadme() {
    readmeModal.classList.remove('active');
    document.body.style.overflow = '';
}
