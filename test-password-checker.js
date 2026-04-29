const PasswordChecker = require('./password-checker.js');

// Create a password checker instance
const checker = new PasswordChecker();

// Test various passwords
const testPasswords = [
    'password',        // Common password
    '123456',          // Only numbers
    'abc',             // Too short
    'abcdefgh',        // No uppercase, numbers, or special chars
    'Abcdefgh',        // No numbers or special chars
    'Abcdefg8',        // No special chars
    'Abcdefg8!',       // Good password
    'Rohit@rk01',      // Strong password from CLI test
    'VeryStrongPassword123!@#' // Very strong password
];

console.log('🔐 Password Checker Test Results');
console.log('===============================\n');

testPasswords.forEach(password => {
    const result = checker.checkPassword(password);
    
    console.log(`Password: "${password}"`);
    console.log(`Valid: ${result.isValid ? '✅' : '❌'}`);
    console.log(`Strength: ${result.strength.replace('_', ' ').toUpperCase()}`);
    console.log(`Score: ${result.score}/100`);
    
    if (result.feedback.length > 0) {
        console.log('Issues:');
        result.feedback.forEach(feedback => console.log(`  • ${feedback}`));
    }
    
    console.log('---');
});

// Test password generation
console.log('\n💡 Generated Password Suggestions:');
for (let i = 0; i < 3; i++) {
    const suggestion = checker.generateSuggestions();
    const result = checker.checkPassword(suggestion);
    console.log(`${i + 1}. ${suggestion} (${result.strength.replace('_', ' ').toUpperCase()}, ${result.score}/100)`);
}

// Test custom configuration
console.log('\n⚙️  Testing Custom Configuration (min 4 chars, no special chars required):');
const customChecker = new PasswordChecker({
    minLength: 4,
    requireSpecialChars: false
});

const customTest = 'Ab12';
const customResult = customChecker.checkPassword(customTest);
console.log(`Password: "${customTest}"`);
console.log(`Valid: ${customResult.isValid ? '✅' : '❌'}`);
console.log(`Strength: ${customResult.strength.replace('_', ' ').toUpperCase()}`);
console.log(`Score: ${customResult.score}/100`);
