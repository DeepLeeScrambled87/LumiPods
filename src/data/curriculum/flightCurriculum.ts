// Flight & Systems Pod - Month 1 Detailed Curriculum
// 4 weeks of comprehensive project-based learning

import type { PodCurriculum } from '../../types/curriculum';

export const FLIGHT_CURRICULUM: PodCurriculum = {
  podId: 'pod-flight',
  podTitle: 'Flight & Systems',
  monthNumber: 1,
  description: 'A comprehensive curriculum designed for personalized, hands-on education with project-based learning, rubric assessment, and evidence collection.',
  unlockRule: 'Average ≥ P across 3 consecutive submissions or ≥ P on 4/5 criteria in a week',
  weeks: [
    // ============ WEEK 1: Parachute Drop Test ============
    {
      weekNumber: 1,
      title: 'Parachute Drop Test',
      subjects: ['math', 'science', 'tech', 'sel'],
      overview: {
        weekNumber: 1,
        title: 'Parachute Drop Test',
        learningTargets: [
          { subject: 'math', icon: '📐', skills: ['elapsed time', 'averages', 'bar/line charts'] },
          { subject: 'science', icon: '🔬', skills: ['gravity/drag', 'fair tests', 'simple conclusion'] },
          { subject: 'tech', icon: '💻', skills: ['optional timer app', 'Python mean calculation'] },
          { subject: 'sel', icon: '💚', skills: ['team roles', 'test discipline'] },
        ],
        safetyNotes: [
          { text: 'Clear drop zone', priority: 'warning' },
          { text: 'Eye protection if overhead drops', priority: 'warning' },
        ],
      },
      tasksBySkillLevel: {
        foundation: [
          { stepNumber: 1, description: 'Build one parachute design' },
          { stepNumber: 2, description: 'Drop 3 times, count seconds out loud' },
          { stepNumber: 3, description: 'Draw a picture of your parachute' },
          { stepNumber: 4, description: 'Tell someone what happened' },
        ],
        intermediate: [
          { stepNumber: 1, description: 'Build two parachute designs (different sizes)' },
          { stepNumber: 2, description: 'Run 5 trials each, record times' },
          { stepNumber: 3, description: 'Calculate average fall time' },
          { stepNumber: 4, description: 'Create a bar chart comparing designs' },
        ],
        advanced: [
          { stepNumber: 1, description: 'Pick one variable (canopy area or mass)' },
          { stepNumber: 2, description: 'Plan a controlled test (≥5 trials/setting)' },
          { stepNumber: 3, description: 'Enter data in a Python notebook, compute mean & stdev' },
          { stepNumber: 4, description: 'Draw a labeled line chart, write a short results section' },
        ],
        pro: [
          { stepNumber: 1, description: 'Design a full investigation with a hypothesis, controls, and safety notes' },
          { stepNumber: 2, description: 'Run a larger dataset, justify your variable choices, and document anomalies' },
          { stepNumber: 3, description: 'Analyze results with code or a spreadsheet, including variation and limitations' },
          { stepNumber: 4, description: 'Present a short technical brief that defends your conclusion with evidence' },
        ],
      },
      codeRequiredByLevel: {
        foundation: false,
        intermediate: false,
        advanced: true,
        pro: true,
      },
      evidence: {
        weekNumber: 1,
        items: [
          { id: 'ev-1-1', label: 'Photo(s) of build/setup', isRequired: true },
          { id: 'ev-1-2', label: 'Short video demo (≤2 min)', isRequired: true },
          { id: 'ev-1-3', label: 'Data table (with units) + labeled chart', isRequired: true },
          { id: 'ev-1-4', label: 'Reflection (3-6 sentences; Pro: 1-2 pages or talk notes)', isRequired: true },
          { id: 'ev-1-5', label: 'Code/notebook link if used (A/Pro)', isRequired: false },
          { id: 'ev-1-6', label: 'Team roles log (who did what)', isRequired: false },
        ],
      },
      rubric: {
        weekNumber: 1,
        criteria: [
          {
            id: 'rb-1-1',
            name: 'Plan & Method',
            description: 'clear question/variables; steps; safety',
            levels: {
              E: 'Needs significant guidance; limited notes; unclear steps',
              D: 'Basic plan; some variables identified; general safety awareness',
              P: 'Clear variables; structured steps; safety protocols followed',
              M: 'Controls & repeats; detailed methodology; comprehensive safety',
            },
          },
          {
            id: 'rb-1-2',
            name: 'Measurement & Data',
            description: 'units, repeats, accuracy, organization',
            levels: {
              E: '1-2 trials; missing units; disorganized data',
              D: '3-4 trials; some units; basic organization',
              P: '≥5 trials; labeled units; well-organized tables',
              M: 'Multiple repeats; precise units; systematic data collection',
            },
          },
          {
            id: 'rb-1-3',
            name: 'Analysis & Reasoning',
            description: 'patterns, conclusions, connections',
            levels: {
              E: 'No clear pattern identified; minimal explanation',
              D: 'Basic pattern noted; simple conclusion',
              P: 'Clear pattern analysis; logical conclusion with evidence',
              M: 'Deep analysis; connections to physics concepts; future questions',
            },
          },
          {
            id: 'rb-1-4',
            name: 'Communication',
            description: 'clarity, visuals, presentation',
            levels: {
              E: 'Unclear explanation; no visuals',
              D: 'Basic explanation; simple visual',
              P: 'Clear explanation; labeled chart/graph',
              M: 'Engaging presentation; professional visuals; audience awareness',
            },
          },
          {
            id: 'rb-1-5',
            name: 'Collaboration',
            description: 'teamwork, roles, contribution',
            levels: {
              E: 'Minimal participation; unclear role',
              D: 'Some participation; basic role understanding',
              P: 'Active participation; clear role; supports team',
              M: 'Leadership moments; helps others; excellent team dynamics',
            },
          },
        ],
        unlockRule: 'Average ≥ P across 3 consecutive submissions or ≥ P on 4/5 criteria',
      },
      materials: {
        weekNumber: 1,
        items: [
          { id: 'mat-1-1', name: 'plastic bag' },
          { id: 'mat-1-2', name: 'paper' },
          { id: 'mat-1-3', name: 'coffee filter' },
          { id: 'mat-1-4', name: 'light fabric scraps' },
          { id: 'mat-1-5', name: 'string' },
          { id: 'mat-1-6', name: 'small payload (toy/washer)' },
          { id: 'mat-1-7', name: 'tape' },
          { id: 'mat-1-8', name: 'scissors' },
          { id: 'mat-1-9', name: 'measuring tape' },
          { id: 'mat-1-10', name: 'phone timer' },
          { id: 'mat-1-11', name: 'notebook' },
        ],
      },
      dailyFlow: {
        weekNumber: 1,
        days: [
          { day: 'Monday', activities: 'safety + plan + build v1', duration: 90 },
          { day: 'Tuesday', activities: 'trial runs; refine data table', duration: 90 },
          { day: 'Wednesday', activities: 'complete trials; start chart', duration: 90 },
          { day: 'Thursday', activities: 'analysis + script/talk prep', duration: 90 },
          { day: 'Friday', activities: '2-5 min share; feedback', duration: 60 },
        ],
      },
    },
    // ============ WEEK 2: Glider Build & Lift ============
    {
      weekNumber: 2,
      title: 'Glider Build & Lift',
      subjects: ['math', 'science', 'arts'],
      overview: {
        weekNumber: 2,
        title: 'Glider Build & Lift',
        learningTargets: [
          { subject: 'math', icon: '📐', skills: ['measurement', 'ratios', 'distance calculations'] },
          { subject: 'science', icon: '🔬', skills: ['lift', 'thrust', 'wing design'] },
          { subject: 'arts', icon: '🎨', skills: ['design aesthetics', 'decoration', 'presentation'] },
        ],
        safetyNotes: [
          { text: 'Launch away from people', priority: 'warning' },
          { text: 'Use blunt-nosed designs', priority: 'info' },
        ],
      },
      tasksBySkillLevel: {
        foundation: [
          { stepNumber: 1, description: 'Fold a basic paper airplane' },
          { stepNumber: 2, description: 'Throw 5 times, mark landing spots' },
          { stepNumber: 3, description: 'Decorate your best flyer' },
          { stepNumber: 4, description: 'Show and tell what you learned' },
        ],
        intermediate: [
          { stepNumber: 1, description: 'Build 3 different glider designs' },
          { stepNumber: 2, description: 'Measure flight distance for each (5 trials)' },
          { stepNumber: 3, description: 'Calculate average distance, create comparison chart' },
          { stepNumber: 4, description: 'Write about which design worked best and why' },
        ],
        advanced: [
          { stepNumber: 1, description: 'Research wing aspect ratios and lift principles' },
          { stepNumber: 2, description: 'Design and test 3 wing configurations' },
          { stepNumber: 3, description: 'Analyze data: distance vs. wing area ratio' },
          { stepNumber: 4, description: 'Create presentation with physics explanations' },
        ],
        pro: [
          { stepNumber: 1, description: 'Research wing loading and stability, then propose a design rationale' },
          { stepNumber: 2, description: 'Prototype and compare at least 3 configurations with tracked variables' },
          { stepNumber: 3, description: 'Model the strongest design choice with a justified evidence claim' },
          { stepNumber: 4, description: 'Create a concise engineering review with recommendations for iteration' },
        ],
      },
      codeRequiredByLevel: { foundation: false, intermediate: false, advanced: false, pro: false },
      evidence: {
        weekNumber: 2,
        items: [
          { id: 'ev-2-1', label: 'Photos of all glider designs', isRequired: true },
          { id: 'ev-2-2', label: 'Flight distance data table', isRequired: true },
          { id: 'ev-2-3', label: 'Comparison chart or graph', isRequired: true },
          { id: 'ev-2-4', label: 'Design reflection (what worked/didn\'t)', isRequired: true },
          { id: 'ev-2-5', label: 'Video of best flight', isRequired: false },
        ],
      },
      rubric: {
        weekNumber: 2,
        criteria: [
          {
            id: 'rb-2-1',
            name: 'Design Process',
            description: 'iteration, creativity, problem-solving',
            levels: {
              E: 'Single attempt; no modifications',
              D: 'Some iteration; basic modifications',
              P: 'Multiple iterations; thoughtful improvements',
              M: 'Systematic iteration; innovative solutions',
            },
          },
          {
            id: 'rb-2-2',
            name: 'Data Collection',
            description: 'accuracy, consistency, organization',
            levels: {
              E: 'Incomplete data; inconsistent methods',
              D: 'Basic data; some consistency',
              P: 'Complete data; consistent methods; organized',
              M: 'Comprehensive data; precise methods; excellent organization',
            },
          },
          {
            id: 'rb-2-3',
            name: 'Scientific Reasoning',
            description: 'understanding of flight principles',
            levels: {
              E: 'No connection to flight concepts',
              D: 'Basic understanding of lift/drag',
              P: 'Clear explanation of flight principles',
              M: 'Deep understanding; applies physics concepts',
            },
          },
          {
            id: 'rb-2-4',
            name: 'Artistic Expression',
            description: 'creativity, craftsmanship, presentation',
            levels: {
              E: 'Minimal effort; no decoration',
              D: 'Basic decoration; some care',
              P: 'Creative design; good craftsmanship',
              M: 'Outstanding creativity; excellent presentation',
            },
          },
        ],
        unlockRule: 'Average ≥ P across 3 consecutive submissions or ≥ P on 4/5 criteria',
      },
      materials: {
        weekNumber: 2,
        items: [
          { id: 'mat-2-1', name: 'cardstock or foam board' },
          { id: 'mat-2-2', name: 'paper (various weights)' },
          { id: 'mat-2-3', name: 'scissors' },
          { id: 'mat-2-4', name: 'ruler' },
          { id: 'mat-2-5', name: 'tape' },
          { id: 'mat-2-6', name: 'paper clips (for weight)' },
          { id: 'mat-2-7', name: 'markers/colored pencils' },
          { id: 'mat-2-8', name: 'measuring tape (long)' },
        ],
      },
      dailyFlow: {
        weekNumber: 2,
        days: [
          { day: 'Monday', activities: 'research lift principles; sketch designs', duration: 90 },
          { day: 'Tuesday', activities: 'build first 2 designs; initial tests', duration: 90 },
          { day: 'Wednesday', activities: 'build design 3; full trial runs', duration: 90 },
          { day: 'Thursday', activities: 'data analysis; decorate best design', duration: 90 },
          { day: 'Friday', activities: 'flight competition; reflection', duration: 60 },
        ],
      },
    },

    // ============ WEEK 3: Control Systems Mini ============
    {
      weekNumber: 3,
      title: 'Control Systems Mini',
      subjects: ['tech', 'math', 'sel'],
      overview: {
        weekNumber: 3,
        title: 'Control Systems Mini',
        learningTargets: [
          { subject: 'tech', icon: '💻', skills: ['basic circuits', 'sensors', 'coding logic'] },
          { subject: 'math', icon: '📐', skills: ['variables', 'conditionals', 'data logging'] },
          { subject: 'sel', icon: '💚', skills: ['persistence', 'debugging mindset', 'peer support'] },
        ],
        safetyNotes: [
          { text: 'Adult supervision for electronics', priority: 'warning' },
          { text: 'Keep batteries away from water', priority: 'info' },
        ],
      },
      tasksBySkillLevel: {
        foundation: [
          { stepNumber: 1, description: 'Build a simple circuit with LED' },
          { stepNumber: 2, description: 'Add a switch to control the light' },
          { stepNumber: 3, description: 'Draw your circuit diagram' },
          { stepNumber: 4, description: 'Explain how it works to someone' },
        ],
        intermediate: [
          { stepNumber: 1, description: 'Build circuit with button and LED' },
          { stepNumber: 2, description: 'Program basic on/off logic (Scratch/MakeCode)' },
          { stepNumber: 3, description: 'Add a second output (buzzer or motor)' },
          { stepNumber: 4, description: 'Document your code with comments' },
        ],
        advanced: [
          { stepNumber: 1, description: 'Design a sensor-based control system' },
          { stepNumber: 2, description: 'Write code with conditionals and variables' },
          { stepNumber: 3, description: 'Log sensor data to file or display' },
          { stepNumber: 4, description: 'Create flowchart and code documentation' },
        ],
        pro: [
          { stepNumber: 1, description: 'Design a control system that solves a clear real-world problem' },
          { stepNumber: 2, description: 'Write modular code with conditionals, variables, and meaningful naming' },
          { stepNumber: 3, description: 'Collect sensor output, diagnose weak spots, and improve reliability' },
          { stepNumber: 4, description: 'Produce technical documentation that another learner could follow' },
        ],
      },
      codeRequiredByLevel: { foundation: false, intermediate: true, advanced: true, pro: true },
      evidence: {
        weekNumber: 3,
        items: [
          { id: 'ev-3-1', label: 'Photo/video of working circuit', isRequired: true },
          { id: 'ev-3-2', label: 'Circuit diagram (hand-drawn or digital)', isRequired: true },
          { id: 'ev-3-3', label: 'Code file or screenshot', isRequired: false },
          { id: 'ev-3-4', label: 'Debugging journal (problems + solutions)', isRequired: true },
          { id: 'ev-3-5', label: 'Demo video explaining how it works', isRequired: true },
        ],
      },
      rubric: {
        weekNumber: 3,
        criteria: [
          {
            id: 'rb-3-1',
            name: 'Technical Implementation',
            description: 'circuit/code functionality',
            levels: {
              E: 'Does not function; major issues',
              D: 'Partially works; some bugs',
              P: 'Fully functional; minor issues',
              M: 'Excellent function; optimized; robust',
            },
          },
          {
            id: 'rb-3-2',
            name: 'Problem Solving',
            description: 'debugging, iteration, persistence',
            levels: {
              E: 'Gave up easily; no debugging attempts',
              D: 'Some attempts; needed significant help',
              P: 'Systematic debugging; solved most issues',
              M: 'Expert debugging; helped others; documented solutions',
            },
          },
          {
            id: 'rb-3-3',
            name: 'Documentation',
            description: 'diagrams, comments, explanations',
            levels: {
              E: 'No documentation',
              D: 'Basic notes; incomplete',
              P: 'Clear documentation; good explanations',
              M: 'Professional documentation; could teach others',
            },
          },
          {
            id: 'rb-3-4',
            name: 'Understanding',
            description: 'can explain how and why it works',
            levels: {
              E: 'Cannot explain',
              D: 'Basic explanation; gaps in understanding',
              P: 'Clear explanation; understands concepts',
              M: 'Deep understanding; can extend concepts',
            },
          },
        ],
        unlockRule: 'Average ≥ P across 3 consecutive submissions or ≥ P on 4/5 criteria',
      },
      materials: {
        weekNumber: 3,
        items: [
          { id: 'mat-3-1', name: 'microcontroller (micro:bit or Arduino)' },
          { id: 'mat-3-2', name: 'LEDs (various colors)' },
          { id: 'mat-3-3', name: 'resistors' },
          { id: 'mat-3-4', name: 'jumper wires' },
          { id: 'mat-3-5', name: 'breadboard' },
          { id: 'mat-3-6', name: 'button/switch' },
          { id: 'mat-3-7', name: 'buzzer (optional)' },
          { id: 'mat-3-8', name: 'sensor (light/temp - optional)' },
          { id: 'mat-3-9', name: 'USB cable' },
          { id: 'mat-3-10', name: 'computer with coding software' },
        ],
      },
      dailyFlow: {
        weekNumber: 3,
        days: [
          { day: 'Monday', activities: 'intro to circuits; build basic LED circuit', duration: 90 },
          { day: 'Tuesday', activities: 'add control (button/code); troubleshoot', duration: 90 },
          { day: 'Wednesday', activities: 'expand project; add features', duration: 90 },
          { day: 'Thursday', activities: 'documentation; prepare demo', duration: 90 },
          { day: 'Friday', activities: 'demo day; peer feedback', duration: 60 },
        ],
      },
    },
    // ============ WEEK 4: Aero Showcase & Reflection ============
    {
      weekNumber: 4,
      title: 'Aero Showcase & Reflection',
      subjects: ['communication', 'integration', 'leadership'],
      overview: {
        weekNumber: 4,
        title: 'Aero Showcase & Reflection',
        learningTargets: [
          { subject: 'communication', icon: '🗣️', skills: ['presentation skills', 'visual aids', 'audience engagement'] },
          { subject: 'integration', icon: '🔗', skills: ['connecting concepts', 'portfolio curation', 'synthesis'] },
          { subject: 'leadership', icon: '⭐', skills: ['peer feedback', 'self-assessment', 'goal setting'] },
        ],
        safetyNotes: [
          { text: 'Practice presentations in safe space', priority: 'info' },
        ],
      },
      tasksBySkillLevel: {
        foundation: [
          { stepNumber: 1, description: 'Choose your favorite project from the month' },
          { stepNumber: 2, description: 'Create a poster or display' },
          { stepNumber: 3, description: 'Practice telling your story (2-3 min)' },
          { stepNumber: 4, description: 'Present to family; answer questions' },
        ],
        intermediate: [
          { stepNumber: 1, description: 'Select 2-3 best artifacts from each week' },
          { stepNumber: 2, description: 'Create a slideshow or video (5-7 min)' },
          { stepNumber: 3, description: 'Connect projects to learning goals' },
          { stepNumber: 4, description: 'Present; give/receive peer feedback' },
        ],
        advanced: [
          { stepNumber: 1, description: 'Curate comprehensive portfolio of month\'s work' },
          { stepNumber: 2, description: 'Create professional presentation (8-10 min)' },
          { stepNumber: 3, description: 'Analyze growth; set goals for next month' },
          { stepNumber: 4, description: 'Lead showcase; mentor younger learners' },
        ],
        pro: [
          { stepNumber: 1, description: 'Curate a portfolio that shows design decisions, evidence, and iteration across the month' },
          { stepNumber: 2, description: 'Produce a polished showcase with visuals, data, and a strong narrative arc' },
          { stepNumber: 3, description: 'Evaluate growth, identify transferable strategies, and set a next challenge' },
          { stepNumber: 4, description: 'Lead discussion, answer questions, and support younger learners with feedback' },
        ],
      },
      codeRequiredByLevel: { foundation: false, intermediate: false, advanced: false, pro: false },
      evidence: {
        weekNumber: 4,
        items: [
          { id: 'ev-4-1', label: 'Presentation slides/poster/video', isRequired: true },
          { id: 'ev-4-2', label: 'Curated portfolio (organized artifacts)', isRequired: true },
          { id: 'ev-4-3', label: 'Self-reflection (what I learned, what was hard)', isRequired: true },
          { id: 'ev-4-4', label: 'Peer feedback received', isRequired: false },
          { id: 'ev-4-5', label: 'Goals for next month', isRequired: true },
          { id: 'ev-4-6', label: 'Recording of presentation', isRequired: false },
        ],
      },
      rubric: {
        weekNumber: 4,
        criteria: [
          {
            id: 'rb-4-1',
            name: 'Presentation Quality',
            description: 'clarity, organization, engagement',
            levels: {
              E: 'Unclear; disorganized; hard to follow',
              D: 'Basic structure; some clarity',
              P: 'Clear and organized; engaging',
              M: 'Professional quality; captivating; memorable',
            },
          },
          {
            id: 'rb-4-2',
            name: 'Portfolio Curation',
            description: 'selection, organization, completeness',
            levels: {
              E: 'Missing artifacts; no organization',
              D: 'Some artifacts; basic organization',
              P: 'Complete artifacts; well-organized',
              M: 'Thoughtfully curated; tells a story',
            },
          },
          {
            id: 'rb-4-3',
            name: 'Self-Reflection',
            description: 'depth, honesty, growth mindset',
            levels: {
              E: 'Surface level; no insights',
              D: 'Some reflection; basic insights',
              P: 'Thoughtful reflection; clear insights',
              M: 'Deep reflection; growth mindset; actionable goals',
            },
          },
          {
            id: 'rb-4-4',
            name: 'Peer Engagement',
            description: 'feedback given/received, collaboration',
            levels: {
              E: 'No engagement with peers',
              D: 'Minimal feedback; passive',
              P: 'Constructive feedback; active listener',
              M: 'Excellent feedback; supports others; leadership',
            },
          },
        ],
        unlockRule: 'Average ≥ P across 3 consecutive submissions or ≥ P on 4/5 criteria',
      },
      materials: {
        weekNumber: 4,
        items: [
          { id: 'mat-4-1', name: 'poster board or digital slides' },
          { id: 'mat-4-2', name: 'markers/art supplies' },
          { id: 'mat-4-3', name: 'all artifacts from weeks 1-3' },
          { id: 'mat-4-4', name: 'portfolio folder or binder' },
          { id: 'mat-4-5', name: 'reflection journal' },
          { id: 'mat-4-6', name: 'camera/phone for recording' },
        ],
      },
      dailyFlow: {
        weekNumber: 4,
        days: [
          { day: 'Monday', activities: 'gather artifacts; plan presentation', duration: 90 },
          { day: 'Tuesday', activities: 'create presentation materials', duration: 90 },
          { day: 'Wednesday', activities: 'practice; peer review', duration: 90 },
          { day: 'Thursday', activities: 'final prep; self-reflection writing', duration: 90 },
          { day: 'Friday', activities: 'showcase day; celebration', duration: 120 },
        ],
      },
    },
  ],
};

export default FLIGHT_CURRICULUM;
