class PasswordChecker {
  constructor(myOptions = {}) {
    // Validate and set configuration
    this.validateOptions(myOptions);

    // Core password requirements
    this.minLength = Math.max(4, Math.min(50, myOptions.minLength || 8));
    this.requireUppercase = myOptions.requireUppercase !== false;
    this.requireLowercase = myOptions.requireLowercase !== false;
    this.requireNumbers = myOptions.requireNumbers !== false;
    this.requireSpecialChars = myOptions.requireSpecialChars !== false;

    // Special characters configuration
    this.specialChars = myOptions.specialChars || "!@#$%^&*()_+-=[]{}|;:,.<>?";
    this.escapedSpecialChars = this.validateSpecialChars(this.specialChars);
    this.commonWords = myOptions.commonWords || [];

    // Expanded common passwords list with more comprehensive coverage
    this.commonPasswords = [
      // Top 10 most common passwords
      "password",
      "123456",
      "123456789",
      "qwerty",
      "abc123",
      "password123",
      "admin",
      "letmein",
      "welcome",
      "monkey",

      // Common variations and patterns
      "12345678",
      "12345",
      "1234",
      "111111",
      "1234567",
      "sunshine",
      "qwertyuiop",
      "iloveyou",
      "princess",
      "admin123",
      "welcome123",
      "master",
      "hello",
      "freedom",
      "whatever",
      "qazwsx",
      "trustno1",
      "123qwe",
      "1q2w3e4r",
      "zxcvbn",

      // Year-based passwords
      "password2023",
      "password2024",
      "password2025",
      "admin2024",
      "1234562024",

      // Common names and words
      "dragon",
      "football",
      "baseball",
      "superman",
      "batman",
      "shadow",
      "michael",
      "jennifer",
      "jordan",
      "daniel",

      // Keyboard patterns
      "asdfgh",
      "zxcvbnm",
      "qwerty123",
      "123abc",
      "abc12345",

      // Leet speak variations
      "p@ssword",
      "passw0rd",
      "p@ssw0rd",
      "adm1n",
      "welc0me",
    ];

    // Additional security settings
    this.maxPasswordLength = myOptions.maxPasswordLength || 128;
    this.checkForSequences = myOptions.checkForSequences !== false;
    this.checkForRepeats = myOptions.checkForRepeats !== false;
  }

  validateOptions(myOptions) {
    if (myOptions === null || typeof myOptions !== "object") {
      throw new Error("Options must be an object");
    }

    // Validate minLength
    if (myOptions.minLength !== undefined) {
      if (
        typeof myOptions.minLength !== "number" ||
        myOptions.minLength < 4 ||
        myOptions.minLength > 50
      ) {
        throw new Error("minLength must be a number between 4 and 50");
      }
    }

    // Validate specialChars
    if (
      myOptions.specialChars !== undefined &&
      typeof myOptions.specialChars !== "string"
    ) {
      throw new Error("specialChars must be a string");
    }
  }

  validateSpecialChars(specialChars) {
    // Ensure special characters are properly escaped for regex
    const cleaned = specialChars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return cleaned;
  }

  /**
   * Checks password strength and validates against security requirements
   * @param {string} pass - The password to check
   * @returns {Object} Result object containing isValid, score, feedback, and strength
   */
  checkPassword(pass) {
    const result = {
      isValid: true,
      score: 0,
      feedback: [],
      strength: "weak",
    };

    // Check password length bounds
    if (pass.length < this.minLength) {
      result.isValid = false;
      result.feedback.push(
        `Password must be at least ${this.minLength} characters long`,
      );
    } else if (pass.length > this.maxPasswordLength) {
      result.isValid = false;
      result.feedback.push(
        `Password must be no more than ${this.maxPasswordLength} characters long`,
      );
    } else {
      result.score += 20;
    }

    // Check for uppercase letters
    if (this.requireUppercase && !/[A-Z]/.test(pass)) {
      result.isValid = false;
      result.feedback.push(
        "Password must contain at least one uppercase letter",
      );
    } else if (/[A-Z]/.test(pass)) {
      result.score += 20;
    }

    // Check for lowercase letters
    if (this.requireLowercase && !/[a-z]/.test(pass)) {
      result.isValid = false;
      result.feedback.push(
        "Password must contain at least one lowercase letter",
      );
    } else if (/[a-z]/.test(pass)) {
      result.score += 20;
    }

    // Check for numbers
    if (this.requireNumbers && !/\d/.test(pass)) {
      result.isValid = false;
      result.feedback.push("Password must contain at least one number");
    } else if (/\d/.test(pass)) {
      result.score += 20;
    }

    // Check for special characters
    if (this.requireSpecialChars) {
      const specialCharRegex = new RegExp(`[${this.escapedSpecialChars}]`);
      if (!specialCharRegex.test(pass)) {
        result.isValid = false;
        result.feedback.push(
          `Password must contain at least one special character (${this.specialChars})`,
        );
      } else {
        result.score += 20;
      }
    }

    // Check for common passwords
    if (this.isCommonPassword(pass)) {
      result.isValid = false;
      result.feedback.push("Password is too common and easily guessable");
      result.score -= 30;
    }

    // Check for sequential patterns (12345, abcde, etc.)
    if (this.checkForSequences && this.hasSequentialPattern(pass)) {
      result.isValid = false;
      result.feedback.push(
        "Password contains sequential patterns that are easy to guess",
      );
      result.score -= 20;
    }

    // Check for repeated characters (aaaa, 1111, etc.)
    if (this.checkForRepeats && this.hasExcessiveRepeats(pass)) {
      result.isValid = false;
      result.feedback.push("Password contains too many repeated characters");
      result.score -= 15;
    }

    // Bonus points for length beyond minimum
    if (pass.length > this.minLength) {
      result.score += Math.min(20, (pass.length - this.minLength) * 2);
    }

    // Determine strength
    if (result.score >= 80) {
      result.strength = "strong";
    } else if (result.score >= 60) {
      result.strength = "medium";
    } else if (result.score >= 40) {
      result.strength = "weak";
    } else {
      result.strength = "very_weak";
    }

    return result;
  }

  isCommonPassword(password) {
    const lowerPassword = password.toLowerCase();
    return this.commonPasswords.some((common) =>
      lowerPassword.includes(common),
    );
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  hasSequentialPattern(password) {
    const lowerPassword = password.toLowerCase();

    // Check for numeric sequences (12345, 54321)
    for (let i = 0; i <= lowerPassword.length - 4; i++) {
      const slice = lowerPassword.slice(i, i + 4);
      if (
        this.isSequential(slice, "0123456789") ||
        this.isSequential(slice, "9876543210")
      ) {
        return true;
      }
    }

    // Check for letter sequences (abcd, dcba)
    for (let i = 0; i <= lowerPassword.length - 4; i++) {
      const slice = lowerPassword.slice(i, i + 4);
      if (
        this.isSequential(slice, "abcdefghijklmnopqrstuvwxyz") ||
        this.isSequential(slice, "zyxwvutsrqponmlkjihgfedcba")
      ) {
        return true;
      }
    }

    // Check for keyboard sequences (qwerty, asdf)
    const keyboardRows = [
      "qwertyuiop",
      "asdfghjkl",
      "zxcvbnm",
      "poiuytrewq",
      "lkjhgfdsa",
      "mnbvcxz",
    ];
    // Iterate through each keyboard row pattern
    for (const row of keyboardRows) {
      for (let i = 0; i <= lowerPassword.length - 4; i++) {
        const slice = lowerPassword.slice(i, i + 4);
        if (row.includes(slice)) {
          return true;
        }
      }
    }

    return false;
  }

  isSequential(slice, sequence) {
    const index = sequence.indexOf(slice);
    return index !== -1;
  }

  hasExcessiveRepeats(password) {
    // Check for 3 or more consecutive identical characters
    const repeatRegex = /(.)\1{2,}/;
    return repeatRegex.test(password);
  }

  // Quick validation method
  isValid(password) {
    return this.checkPassword(password).isValid;
  }

  // Get strength only
  getStrength(password) {
    const result = this.checkPassword(password);
    return result.strength;
  }

  // Generate password suggestions
  generateSuggestions(length = 12) {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = this.specialChars;
    const allChars = uppercase + lowercase + numbers + special;

    let password = "";

    // Ensure at least one of each required character type
    if (this.requireUppercase)
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
    if (this.requireLowercase)
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
    if (this.requireNumbers)
      password += numbers[Math.floor(Math.random() * numbers.length)];
    if (this.requireSpecialChars)
      password += special[Math.floor(Math.random() * special.length)];

    // Fill remaining length with random characters
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }
}

/* istanbul ignore next */
if (require.main === module) {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const checker = new PasswordChecker();

  console.log("🔐 Password Checker");
  console.log("==================");
  console.log(
    'Enter a password to check its strength, or type "generate" for a strong password suggestion.',
  );
  console.log('Type "exit" to quit.\n');

  function askForPassword() {
    rl.question("Enter password: ", (input) => {
      if (input.toLowerCase() === "exit") {
        rl.close();
        return;
      }

      if (input.toLowerCase() === "generate") {
        const suggestion = checker.generateSuggestions();
        console.log(`\n💡 Suggested strong password: ${suggestion}\n`);
        askForPassword();
        return;
      }

      const result = checker.checkPassword(input);

      console.log(`\n📊 Password Analysis:`);
      console.log(`   Valid: ${result.isValid ? "✅" : "❌"}`);
      console.log(
        `   Strength: ${result.strength.replace("_", " ").toUpperCase()}`,
      );
      console.log(`   Score: ${result.score}/100`);

      if (result.feedback.length > 0) {
        console.log(`\n⚠️  Feedback:`);
        result.feedback.forEach((feedback) => console.log(`   • ${feedback}`));
      }

      console.log("\n");
      askForPassword();
    });
  }

  askForPassword();
}

module.exports = PasswordChecker;
