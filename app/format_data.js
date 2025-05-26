const fs = require('fs');
const path = require('path');

// Paths to input JSON files
const dataDir = path.join(__dirname, 'dataset');
const compatibilityFile = path.join(dataDir, 'compatibility-data.json');
const signReportsFile = path.join(dataDir, 'sign-reports.json');
const outputFile = path.join(dataDir, 'astro_formatted.jsonl');

// Load and parse JSON files
if (!fs.existsSync(compatibilityFile) || !fs.existsSync(signReportsFile)) {
  console.error(`Please ensure both files exist:\n - ${compatibilityFile}\n - ${signReportsFile}`);
  process.exit(1);
}

const compatibilityData = JSON.parse(fs.readFileSync(compatibilityFile, 'utf-8')).pairs;
const signReportsData = JSON.parse(fs.readFileSync(signReportsFile, 'utf-8')).profiles;

const writeStream = fs.createWriteStream(outputFile, { flags: 'w' });

// Helper: create a ChatML JSONL record
function writeRecord(messages) {
  writeStream.write(JSON.stringify({ messages }) + '\n');
}

// Helper: generate self-improvement advice based on sign report
function generateAdvice(report, aspect) {
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

  // Generate specific advice based on the aspect and themes
  const sign = aspect.sign_name;
  if (themes[sign]) {
    themes[sign].forEach(theme => {
      advice.push(`**${theme.charAt(0).toUpperCase() + theme.slice(1)} Development**:\n` +
        `- Set specific goals to enhance your ${theme} abilities\n` +
        `- Practice daily exercises to strengthen your ${theme} skills\n` +
        `- Seek opportunities that challenge your ${theme} potential\n` +
        `- Track your progress in developing ${theme} over time\n` +
        `- Identify role models who excel in ${theme} for inspiration\n` +
        `- Create a support system to help you develop ${theme}\n` +
        `- Reflect on how ${theme} contributes to your overall growth\n` +
        `- Celebrate your progress in developing ${theme}`);
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
    adviceParts.push(generateAdvice(info.report, info));
  });
  
  const reportText = reportParts.join('\n\n');
  const adviceText = adviceParts.join('\n\n');

  // Add self-improvement focused prompts
  writeRecord([
    { role: 'system', content: 'You are an insightful astrology coach focused on personal growth and self-improvement.' },
    { role: 'user', content: `Birthday: ${p.birthdate} ${p.birthtime}, ${p.location} (${p.gender})\nProvide a detailed sign report with specific self-improvement advice.` },
    { role: 'assistant', content: `${reportText}\n\n**Self-Improvement Action Plan**:\n${adviceText}` }
  ]);

  // Add specific self-improvement prompts for each aspect
  Object.values(aspects).forEach(info => {
    const aspectAdvice = generateAdvice(info.report, info);
    writeRecord([
      { role: 'system', content: 'You are an astrology coach specializing in personal development.' },
      { role: 'user', content: `Birthday: ${p.birthdate} ${p.birthtime}, ${p.location} (${p.gender})\nWhat specific self-improvement advice would you give based on their ${info.planet_name} in ${info.sign_name}?` },
      { role: 'assistant', content: `${info.report}\n\n**Actionable Steps**:\n${aspectAdvice}` }
    ]);
  });
});

// Format compatibility pairs with relationship advice focus
compatibilityData.forEach(pair => {
  const p1 = pair.person1;
  const p2 = pair.person2;
  
  // Format each compatibility type
  ['physical_compatibility', 'sexual_compatibility', 'emotional_compatibility'].forEach(compType => {
    const block = pair[compType].data.content;
    const descriptions = [];
    const advice = [];
    
    block.forEach(item => {
      item.reading.forEach(rd => {
        descriptions.push(`${rd.title}: ${rd.description}`);
        // Generate relationship advice based on the reading
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
    writeRecord([
      { role: 'system', content: 'You are an astrology relationship advisor focused on helping couples improve their connection.' },
      { role: 'user', content: `Compare: ${p1.birthdate} ${p1.birthtime} ${p1.location} vs ${p2.birthdate} ${p2.birthtime} ${p2.location}\nWhat specific advice would you give to improve their ${compType.replace(/_/g, ' ')}?` },
      { role: 'assistant', content: `**${compType.replace(/_/g, ' ')} Analysis**:\n${answerText}\n\n**Relationship Improvement Plan**:\n${adviceText}` }
    ]);
  });
});

writeStream.end(() => {
  console.log(`Formatted JSONL saved to ${outputFile}`);
});