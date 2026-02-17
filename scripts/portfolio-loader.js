(() => {
    // Portfolio projects configuration
    const portfolioProjects = [
        {
            name: "Example Product Page",
            folder: "example-product-page",
            description: "A modern, responsive product showcase page with dynamic features and smooth animations.",
            tags: ["HTML", "CSS", "JavaScript"]
        }
        // Add more projects here as they are added to the portfolio folder
        // {
        //     name: "Project Name",
        //     folder: "folder-name",
        //     description: "Project description",
        //     tags: ["Tech1", "Tech2"]
        // }
    ];

    // Generate portfolio cards
    function loadPortfolio() {
        const container = document.getElementById('portfolio-grid');
        
        if (!container) {
            console.error('Portfolio grid container not found');
            return;
        }

        portfolioProjects.forEach((project, index) => {
            const card = document.createElement('div');
            card.className = 'portfolio-card';
            card.style.animationDelay = `${index * 0.1}s`;
            
            const projectUrl = `./portfolio/${project.folder}/index.html`;
            
            card.innerHTML = `
                <h3>${project.name}</h3>
                <p>${project.description}</p>
                ${project.tags ? `<div class="portfolio-tags" style="margin-bottom: 1rem;">
                    ${project.tags.map(tag => `<span style="display: inline-block; padding: 0.25rem 0.75rem; background: rgba(0, 168, 255, 0.2); border-radius: 15px; font-size: 0.9rem; margin-right: 0.5rem; margin-bottom: 0.5rem;">${tag}</span>`).join('')}
                </div>` : ''}
                <a href="${projectUrl}" class="btn-view" target="_blank" rel="noopener">
                    <i class="fas fa-external-link-alt"></i> View Project
                </a>
            `;
            
            // Make entire card clickable
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking the button directly
                if (!e.target.closest('.btn-view')) {
                    window.open(projectUrl, '_blank');
                }
            });
            
            container.appendChild(card);
        });
    }

    // Load portfolio when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPortfolio);
    } else {
        loadPortfolio();
    }
})();
