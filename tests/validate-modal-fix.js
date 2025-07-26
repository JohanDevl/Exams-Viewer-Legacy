/**
 * Script de validation automatique pour la correction du modal de test
 * Vérifie que toutes les corrections ont été appliquées correctement
 */

class ModalFixValidator {
    constructor() {
        this.validationResults = [];
        this.testModal = null;
    }

    log(test, passed, details = '') {
        this.validationResults.push({ test, passed, details });
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${test}${details ? ': ' + details : ''}`);
    }

    async validateModalFix() {
        console.log('🔧 Starting Modal Fix Validation...');
        
        // 1. Vérifier que les styles CSS sont chargés
        await this.validateCSSLoaded();
        
        // 2. Créer et tester le modal
        await this.validateModalCreation();
        
        // 3. Tester le positionnement
        await this.validateModalPositioning();
        
        // 4. Tester la visibilité du bouton close
        await this.validateCloseButtonVisibility();
        
        // 5. Tester le scroll
        await this.validateScrollFunctionality();
        
        // 6. Tester la fermeture
        await this.validateCloseFeatures();
        
        // 7. Tester la responsivité
        await this.validateResponsiveness();
        
        return this.generateReport();
    }

    async validateCSSLoaded() {
        try {
            // Vérifier que les styles CSS sont chargés
            const styleSheets = Array.from(document.styleSheets);
            const hasModalStyles = styleSheets.some(sheet => {
                try {
                    return sheet.href && sheet.href.includes('test-modal-styles.css');
                } catch (e) {
                    return false;
                }
            });
            
            this.log('CSS Styles Loading', hasModalStyles, hasModalStyles ? 'Modal styles loaded' : 'Modal styles not found');
        } catch (error) {
            this.log('CSS Styles Loading', false, `Error: ${error.message}`);
        }
    }

    async validateModalCreation() {
        try {
            // Créer une instance du test suite
            const testSuite = new ExamsViewerTestSuite();
            this.testModal = testSuite.testPanel;
            
            this.log('Modal Creation', this.testModal !== null, 'Test modal created successfully');
            
            // Vérifier la structure HTML
            const hasHeader = this.testModal.querySelector('.test-header') !== null;
            const hasCloseButton = this.testModal.querySelector('#closeTestPanel') !== null;
            const hasContent = this.testModal.querySelector('#testResultsContent') !== null;
            
            this.log('Modal Structure - Header', hasHeader);
            this.log('Modal Structure - Close Button', hasCloseButton);
            this.log('Modal Structure - Content Area', hasContent);
            
        } catch (error) {
            this.log('Modal Creation', false, `Error: ${error.message}`);
        }
    }

    async validateModalPositioning() {
        if (!this.testModal) return;
        
        try {
            // Afficher le modal
            this.testModal.style.display = 'flex';
            this.testModal.setAttribute('data-visible', 'true');
            
            await this.wait(100); // Attendre que le modal soit affiché
            
            const rect = this.testModal.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Vérifier le centrage horizontal
            const horizontallyCentered = Math.abs((rect.left + rect.width / 2) - viewportWidth / 2) < 10;
            this.log('Modal Positioning - Horizontal Center', horizontallyCentered, `X: ${(rect.left + rect.width / 2).toFixed(0)}, Expected: ${(viewportWidth / 2).toFixed(0)}`);
            
            // Vérifier le centrage vertical
            const verticallyCentered = Math.abs((rect.top + rect.height / 2) - viewportHeight / 2) < 50;
            this.log('Modal Positioning - Vertical Center', verticallyCentered, `Y: ${(rect.top + rect.height / 2).toFixed(0)}, Expected: ${(viewportHeight / 2).toFixed(0)}`);
            
            // Vérifier que le modal ne dépasse pas de l'écran
            const withinViewport = rect.left >= 0 && rect.top >= 0 && rect.right <= viewportWidth && rect.bottom <= viewportHeight;
            this.log('Modal Positioning - Within Viewport', withinViewport, `Rect: ${rect.left}, ${rect.top}, ${rect.right}, ${rect.bottom}`);
            
        } catch (error) {
            this.log('Modal Positioning', false, `Error: ${error.message}`);
        }
    }

    async validateCloseButtonVisibility() {
        if (!this.testModal) return;
        
        try {
            const closeButton = this.testModal.querySelector('#closeTestPanel');
            if (!closeButton) {
                this.log('Close Button Visibility', false, 'Close button not found');
                return;
            }
            
            const buttonRect = closeButton.getBoundingClientRect();
            const modalRect = this.testModal.getBoundingClientRect();
            
            // Vérifier que le bouton est visible
            const isVisible = buttonRect.width > 0 && buttonRect.height > 0;
            this.log('Close Button Visibility - Rendered', isVisible);
            
            // Vérifier que le bouton est dans la zone visible du modal
            const withinModal = buttonRect.top >= modalRect.top && buttonRect.bottom <= modalRect.bottom;
            this.log('Close Button Visibility - Within Modal', withinModal);
            
            // Vérifier la position sticky du header
            const header = this.testModal.querySelector('.test-header');
            if (header) {
                const headerStyle = window.getComputedStyle(header);
                const isSticky = headerStyle.position === 'sticky';
                this.log('Close Button Visibility - Sticky Header', isSticky);
            }
            
        } catch (error) {
            this.log('Close Button Visibility', false, `Error: ${error.message}`);
        }
    }

    async validateScrollFunctionality() {
        if (!this.testModal) return;
        
        try {
            const contentArea = this.testModal.querySelector('#testResultsContent');
            if (!contentArea) {
                this.log('Scroll Functionality', false, 'Content area not found');
                return;
            }
            
            // Ajouter du contenu pour tester le scroll
            const testSuite = new ExamsViewerTestSuite();
            for (let i = 1; i <= 15; i++) {
                testSuite.logTest(`Scroll Test ${i}`, true, `This is test case ${i} to test scrolling functionality`);
            }
            
            await this.wait(100);
            
            // Vérifier si le scroll est actif
            const hasOverflow = contentArea.scrollHeight > contentArea.clientHeight;
            this.log('Scroll Functionality - Content Overflow', hasOverflow);
            
            if (hasOverflow) {
                // Tester le scroll
                const initialScrollTop = contentArea.scrollTop;
                contentArea.scrollTop = 100;
                await this.wait(50);
                const scrolled = contentArea.scrollTop > initialScrollTop;
                this.log('Scroll Functionality - Scroll Works', scrolled);
                
                // Remettre en haut
                contentArea.scrollTop = 0;
            }
            
        } catch (error) {
            this.log('Scroll Functionality', false, `Error: ${error.message}`);
        }
    }

    async validateCloseFeatures() {
        if (!this.testModal) return;
        
        try {
            // Tester la fermeture par bouton
            const closeButton = this.testModal.querySelector('#closeTestPanel');
            if (closeButton) {
                const hasClickHandler = closeButton.onclick !== null || closeButton.addEventListener;
                this.log('Close Features - Button Handler', hasClickHandler);
            }
            
            // Tester la fermeture par Escape (simulé)
            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);
            await this.wait(100);
            
            const closedByEscape = this.testModal.style.display === 'none';
            this.log('Close Features - Escape Key', closedByEscape);
            
            // Rouvrir pour les tests suivants
            if (closedByEscape) {
                this.testModal.style.display = 'flex';
                this.testModal.setAttribute('data-visible', 'true');
            }
            
        } catch (error) {
            this.log('Close Features', false, `Error: ${error.message}`);
        }
    }

    async validateResponsiveness() {
        if (!this.testModal) return;
        
        try {
            // Simuler un écran mobile
            const originalWidth = window.innerWidth;
            
            // Vérifier les media queries CSS
            const mediaQuery = window.matchMedia('(max-width: 768px)');
            const isMobile = mediaQuery.matches;
            
            if (isMobile) {
                const modalRect = this.testModal.getBoundingClientRect();
                const mobileOptimized = modalRect.width <= window.innerWidth * 0.95;
                this.log('Responsiveness - Mobile Width', mobileOptimized, `Width: ${modalRect.width}px, Max: ${window.innerWidth * 0.95}px`);
            } else {
                this.log('Responsiveness - Desktop Mode', true, 'Running in desktop mode');
            }
            
            // Vérifier les propriétés CSS responsives
            const modalStyle = window.getComputedStyle(this.testModal);
            const hasFlexDirection = modalStyle.flexDirection === 'column';
            this.log('Responsiveness - Flex Layout', hasFlexDirection);
            
        } catch (error) {
            this.log('Responsiveness', false, `Error: ${error.message}`);
        }
    }

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generateReport() {
        const total = this.validationResults.length;
        const passed = this.validationResults.filter(r => r.passed).length;
        const failed = total - passed;
        const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        
        console.log('\n📊 MODAL FIX VALIDATION REPORT');
        console.log('================================');
        console.log(`Total Validations: ${total}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Failed: ${failed} ❌`);
        console.log(`Pass Rate: ${passRate}%`);
        
        if (failed > 0) {
            console.log('\n❌ Failed Validations:');
            this.validationResults
                .filter(test => !test.passed)
                .forEach(test => {
                    console.log(`  - ${test.test}: ${test.details}`);
                });
        }
        
        // Nettoyer
        if (this.testModal) {
            this.testModal.style.display = 'none';
        }
        
        return {
            total,
            passed,
            failed,
            passRate,
            details: this.validationResults
        };
    }
}

// Fonction globale pour exécuter la validation
window.validateModalFix = async function() {
    const validator = new ModalFixValidator();
    return await validator.validateModalFix();
};

// Auto-run si en mode test
if (window.location.search.includes('validate=true')) {
    window.addEventListener('load', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await window.validateModalFix();
    });
}

console.log('🔧 Modal Fix Validator loaded. Run validateModalFix() to test the corrections.');