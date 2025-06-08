document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('demo-modal');
    const closeButton = document.getElementById('modal-close-btn');
    
    // Show modal on page load
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      
      // Focus on close button for accessibility
      closeButton?.focus();
    }
  
    // Close modal handler
    const closeModal = () => {
      if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
      }
    };
  
    // Event listeners
    closeButton?.addEventListener('click', closeModal);
  
    // Close modal on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.classList.contains('active')) {
        closeModal();
      }
    });
  
    // Close modal when clicking outside
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  });