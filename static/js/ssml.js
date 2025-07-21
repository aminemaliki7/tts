// SSML Editor JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeSSMLEditor();
});

function initializeSSMLEditor() {
    const textarea = document.getElementById('ssml-content');
    
    if (textarea) {
        // Auto-save SSML content as draft
        let saveTimeout;
        textarea.addEventListener('input', function() {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                localStorage.setItem('realtalkSSMLDraft', this.value);
            }, 1000);
        });
        
        // Load SSML draft on page load
        const savedSSMLDraft = localStorage.getItem('realtalkSSMLDraft');
        if (savedSSMLDraft && textarea.value.trim() === getDefaultSSML().trim()) {
            textarea.value = savedSSMLDraft;
        }
        
        // Add syntax highlighting indicators
        addSSMLValidation(textarea);
    }
}

function insertTag(startTag, endTag = '') {
    const textarea = document.getElementById('ssml-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    // Insert the tags
    const newText = text.substring(0, start) + startTag + selectedText + endTag + text.substring(end);
    textarea.value = newText;
    
    // Set cursor position after insertion
    if (selectedText.length === 0) {
        // If no text was selected, place cursor between tags
        const newCursorPos = start + startTag.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    } else {
        // If text was selected, select the text with tags
        const newSelectionStart = start;
        const newSelectionEnd = start + startTag.length + selectedText.length + endTag.length;
        textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
    }
    
    textarea.focus();
    
    // Trigger auto-save
    textarea.dispatchEvent(new Event('input'));
}

function addSSMLValidation(textarea) {
    let validationTimeout;
    
    textarea.addEventListener('input', function() {
        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(() => {
            validateSSML(this.value);
        }, 500);
    });
}

function validateSSML(content) {
    // Basic SSML validation
    const errors = [];
    
    // Check if it starts and ends with <speak> tags
    if (!content.trim().startsWith('<speak>') || !content.trim().endsWith('</speak>')) {
        errors.push('SSML must be wrapped in <speak> tags');
    }
    
    // Check for unclosed tags (basic check)
    const openTags = content.match(/<(\w+)(?:\s[^>]*)?>(?![^<]*<\/\1>)/g);
    if (openTags && openTags.length > 0) {
        // Filter out self-closing tags like <break/>
        const unclosedTags = openTags.filter(tag => !tag.endsWith('/>') && !tag.includes('break'));
        if (unclosedTags.length > 0) {
            errors.push('Some tags may not be properly closed');
        }
    }
    
    // Display validation results
    displayValidationResults(errors);
}

function displayValidationResults(errors) {
    // Remove existing validation message
    const existingMessage = document.getElementById('ssmlValidation');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    if (errors.length > 0) {
        const validationDiv = document.createElement('div');
        validationDiv.id = 'ssmlValidation';
        validationDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 8px 16px;
            font-size: 12px;
            background-color: #000;
            color: #fff;
            border: 1px solid #000;
            z-index: 1001;
            font-family: monospace;
            text-transform: uppercase;
            letter-spacing: 1px;
        `;
        
        validationDiv.innerHTML = `SSML VALIDATION: ${errors[0]}`;
        document.body.appendChild(validationDiv);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (validationDiv && validationDiv.parentNode) {
                validationDiv.remove();
            }
        }, 3000);
    }
}

function getDefaultSSML() {
    return `<speak>
    Enter your text here with SSML tags to control how it's spoken.
    
    <break time="1s"/>
    
    You can add <prosody rate="slow">slower speech</prosody> or 
    <prosody rate="fast">faster speech</prosody>.
    
    <break time="500ms"/>
    
    Or change the <prosody pitch="+20%">pitch of the voice</prosody>.
</speak>`;
}

// Quick insert functions for common patterns
function insertPause(duration = "1s") {
    insertTag(`<break time="${duration}"/>`);
}

function insertProsody(type, value) {
    insertTag(`<prosody ${type}="${value}">`, `</prosody>`);
}

function insertEmphasis(level = "strong") {
    insertTag(`<emphasis level="${level}">`, `</emphasis>`);
}

// Export functions for potential use in other scripts
window.SSMLEditor = {
    insertTag,
    insertPause,
    insertProsody,
    insertEmphasis,
    validateSSML
};
