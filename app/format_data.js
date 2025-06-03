const fs = require('fs');
const path = require('path');

// Paths to input JSON files
const dataDir = path.join(__dirname, 'dataset');
const compatibilityFile = path.join(dataDir, 'compatibility-data.json');
const signReportsFile = path.join(dataDir, 'sign-reports.json');
const outputFile = path.join(dataDir, 'qwen3_training_data.jsonl');

// Load and parse JSON files
if (!fs.existsSync(compatibilityFile) || !fs.existsSync(signReportsFile)) {
  console.error(`Please ensure both files exist:\n - ${compatibilityFile}\n - ${signReportsFile}`);
  process.exit(1);
}

const compatibilityData = JSON.parse(fs.readFileSync(compatibilityFile, 'utf-8')).pairs;
const signReportsData = JSON.parse(fs.readFileSync(signReportsFile, 'utf-8')).profiles;

const writeStream = fs.createWriteStream(outputFile, { flags: 'w' });

// Helper: create a Qwen3 training record
function writeTrainingRecord(instruction, input, output) {
  const record = {
    instruction,
    input,
    output
  };
  writeStream.write(JSON.stringify(record) + '\n');
}

// Helper: generate self-improvement advice based on sign report
function generateAdvice(report, aspect, person) {
  const advice = [];
  
  // Extract key themes from the report
  const themes = {
    'Aries': [
      'leadership', 'initiative', 'courage', 'independence',
      'assertiveness', 'energy', 'pioneering', 'self-confidence'
    ],
    'Taurus': [
      'stability', 'patience', 'sensuality', 'security',
      'practicality', 'determination', 'material comfort', 'loyalty'
    ],
    'Gemini': [
      'communication', 'learning', 'adaptability', 'curiosity',
      'versatility', 'social skills', 'intellectual growth', 'expression'
    ],
    'Cancer': [
      'emotional intelligence', 'nurturing', 'intuition', 'home life',
      'empathy', 'family bonds', 'self-care', 'emotional security'
    ],
    'Leo': [
      'leadership', 'creativity', 'self-expression', 'confidence',
      'generosity', 'charisma', 'dignity', 'personal power'
    ],
    'Virgo': [
      'organization', 'practicality', 'service', 'health',
      'attention to detail', 'analytical skills', 'efficiency', 'self-improvement'
    ],
    'Libra': [
      'relationships', 'harmony', 'balance', 'diplomacy',
      'social skills', 'fairness', 'partnership', 'aesthetic sense'
    ],
    'Scorpio': [
      'transformation', 'intensity', 'emotional depth', 'power',
      'intuition', 'mystery', 'passion', 'resilience'
    ],
    'Sagittarius': [
      'adventure', 'philosophy', 'optimism', 'freedom',
      'learning', 'exploration', 'wisdom', 'spiritual growth'
    ],
    'Capricorn': [
      'ambition', 'discipline', 'responsibility', 'achievement',
      'practicality', 'long-term planning', 'self-control', 'career growth'
    ],
    'Aquarius': [
      'innovation', 'humanitarianism', 'independence', 'intellectual growth',
      'originality', 'social awareness', 'futuristic thinking', 'group dynamics'
    ],
    'Pisces': [
      'creativity', 'spirituality', 'empathy', 'intuition',
      'artistic expression', 'compassion', 'dreaming', 'emotional understanding'
    ]
  };

  // Generate personalized advice based on the aspect, themes, and person's details
  const sign = aspect.sign_name;
  if (themes[sign]) {
    themes[sign].forEach(theme => {
      // Create personalized advice based on location and other factors
      const locationBasedAdvice = person.location ? 
        `- Explore local opportunities in ${person.location} to develop your ${theme}\n` : '';
      
      const genderBasedAdvice = person.gender ?
        `- Consider how your ${theme} development aligns with your personal identity\n` : '';
      
      const birthTimeAdvice = person.birthtime ?
        `- Your birth time suggests optimal periods for ${theme} development\n` : '';

      advice.push(`**${theme.charAt(0).toUpperCase() + theme.slice(1)} Development**:\n` +
        `- Create a personalized ${theme} development plan based on your unique circumstances\n` +
        locationBasedAdvice +
        genderBasedAdvice +
        birthTimeAdvice +
        `- Identify specific challenges in your environment that can help strengthen your ${theme}\n` +
        `- Connect with local mentors or groups that can support your ${theme} growth\n` +
        `- Document your personal journey in developing ${theme}\n` +
        `- Adapt general ${theme} practices to fit your individual lifestyle and needs`);
    });
  }

  return advice.join('\n\n');
}

// Format single-person profiles with self-improvement focus
signReportsData.forEach(profile => {
  const p = profile.person;
  const aspects = profile.aspects;
  
  // Create a comprehensive profile report
  const reportParts = [];
  const adviceParts = [];
  
  Object.values(aspects).forEach(info => {
    reportParts.push(`**${info.planet_name} in ${info.sign_name} Report**:\n${info.report}`);
    adviceParts.push(generateAdvice(info.report, info, p));
  });
  
  const reportText = reportParts.join('\n\n');
  const adviceText = adviceParts.join('\n\n');

  // Add self-improvement focused prompts
  writeTrainingRecord(
    "You are an insightful astrology coach focused on personal growth and self-improvement. Provide detailed sign reports with specific self-improvement advice.",
    `Birthday: ${p.birthdate} ${p.birthtime}, ${p.location} (${p.gender})`,
    `${reportText}\n\n**Self-Improvement Action Plan**:\n${adviceText}`
  );

  // Add specific self-improvement prompts for each aspect
  Object.values(aspects).forEach(info => {
    const aspectAdvice = generateAdvice(info.report, info, p);
    writeTrainingRecord(
      "You are an astrology coach specializing in personal development. Provide specific self-improvement advice based on planetary positions.",
      `Birthday: ${p.birthdate} ${p.birthtime}, ${p.location} (${p.gender})\nWhat specific self-improvement advice would you give based on their ${info.planet_name} in ${info.sign_name}?`,
      `${info.report}\n\n**Actionable Steps**:\n${aspectAdvice}`
    );
  });
});
// Format compatibility pairs with relationship advice focus
compatibilityData.forEach((pair, index) => { // Added 'index' to see which pair is problematic
  const p1 = pair.person1;
  const p2 = pair.person2;

  console.log(`\n--- Processing Pair ${index} ---`);
  console.log(`Person 1: ${p1.birthdate}, ${p1.location}`);
  console.log(`Person 2: ${p2.birthdate}, ${p2.location}`);
  console.log("Full pair object:", JSON.stringify(pair, null, 2)); // Stringify for full view

  ['physical_compatibility', 'sexual_compatibility', 'emotional_compatibility'].forEach(compType => {
    console.log(`  --- Checking compType: ${compType} ---`);

    console.log(`  pair[compType]:`, JSON.stringify(pair[compType], null, 2));

    // Add a robust check before trying to access .data.content
    if (pair[compType] && pair[compType].data && pair[compType].data.content) {
      const block = pair[compType].data.content;
      console.log(`  Successfully retrieved block for ${compType}. Block length: ${block.length}`);

      const descriptions = [];
      const advice = [];

      block.forEach(item => {
        item.reading.forEach(rd => {
          descriptions.push(`${rd.title}: ${rd.description}`);
          advice.push(`**${rd.title} Improvement**:\n` +
            `- Practice open communication about ${rd.title.toLowerCase()}\n` +
            `- Set mutual goals for enhancing ${rd.title.toLowerCase()}\n` +
            `- Create a safe space for discussing ${rd.title.toLowerCase()} concerns\n` +
            `- Develop shared activities that strengthen ${rd.title.toLowerCase()}`);
        });
      });

      const answerText = descriptions.join('\n\n');
      const adviceText = advice.join('\n\n');

      // Add relationship advice focused prompts
      writeTrainingRecord(
        "You are an astrology relationship advisor focused on helping couples improve their connection. Provide specific advice to enhance their relationship.",
        `Compare: ${p1.birthdate} ${p1.birthtime} ${p1.location} vs ${p2.birthdate} ${p2.birthtime} ${p2.location}\nWhat specific advice would you give to improve their ${compType.replace(/_/g, ' ')}?`,
        `**${compType.replace(/_/g, ' ')} Analysis**:\n${answerText}\n\n**Relationship Improvement Plan**:\n${adviceText}`
      );
    } else {
      console.error(`ERROR: Data structure missing 'data' or 'content' for compType: ${compType} in Pair ${index}.`);
      console.error(`Problematic part:`, JSON.stringify(pair[compType], null, 2));
    }
  });
});
// // Format compatibility pairs with relationship advice focus
// compatibilityData.forEach(pair => {
//   const p1 = pair.person1;
//   const p2 = pair.person2;
  
//   // Format each compatibility type
//   ['physical_compatibility', 'sexual_compatibility', 'emotional_compatibility'].forEach(compType => {
//     const block = pair[compType].data.content;
//     const descriptions = [];
//     const advice = [];
    
//     block.forEach(item => {
//       item.reading.forEach(rd => {
//         descriptions.push(`${rd.title}: ${rd.description}`);
//         advice.push(`**${rd.title} Improvement**:\n` +
//           `- Practice open communication about ${rd.title.toLowerCase()}\n` +
//           `- Set mutual goals for enhancing ${rd.title.toLowerCase()}\n` +
//           `- Create a safe space for discussing ${rd.title.toLowerCase()} concerns\n` +
//           `- Develop shared activities that strengthen ${rd.title.toLowerCase()}`);
//       });
//     });
    
//     const answerText = descriptions.join('\n\n');
//     const adviceText = advice.join('\n\n');

//     // Add relationship advice focused prompts
//     writeTrainingRecord(
//       "You are an astrology relationship advisor focused on helping couples improve their connection. Provide specific advice to enhance their relationship.",
//       `Compare: ${p1.birthdate} ${p1.birthtime} ${p1.location} vs ${p2.birthdate} ${p2.birthtime} ${p2.location}\nWhat specific advice would you give to improve their ${compType.replace(/_/g, ' ')}?`,
//       `**${compType.replace(/_/g, ' ')} Analysis**:\n${answerText}\n\n**Relationship Improvement Plan**:\n${adviceText}`
//     );
//   });
// });

writeStream.end(() => {
  console.log(`Qwen3 training data saved to ${outputFile}`);
});