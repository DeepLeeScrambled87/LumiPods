// Legacy WeekPod type for backward compatibility
interface WeekPodBlock {
  id: string;
  title: string;
  description: string;
  type: 'core' | 'extension' | 'challenge';
  duration: string;
  supportLevel: 'independent' | 'guided' | 'collaborative';
  objectives?: string[];
  resources?: { name: string; url: string }[];
}

interface WeekPodDay {
  day: number;
  title: string;
  description: string;
  estimatedTime: string;
  blocks: WeekPodBlock[];
}

interface WeekPodMaterial {
  id: string;
  name: string;
  quantity: string;
  category: string;
  description?: string;
  alternatives?: string[];
}

interface WeekPod {
  id: string;
  title: string;
  description: string;
  week: number;
  estimatedHours: number;
  learningObjectives: string[];
  days: WeekPodDay[];
  materials: WeekPodMaterial[];
  safetyProtocols?: string[];
  frenchVocabulary?: { term: string; translation: string; pronunciation: string }[];
}

export const week1ParachuteDropTest: WeekPod = {
  id: 'week1-parachute',
  title: 'Parachute Drop Test',
  description: 'Explore physics through hands-on parachute design and testing',
  week: 1,
  estimatedHours: 15,
  learningObjectives: [
    'Understand air resistance and gravity',
    'Apply scientific method through experimentation',
    'Develop design thinking and problem-solving skills',
    'Practice measurement and data collection',
    'Collaborate effectively in team challenges'
  ],
  days: [
    {
      day: 1,
      title: 'Physics Foundations',
      description: 'Introduction to forces, gravity, and air resistance concepts',
      estimatedTime: '3 hours',
      blocks: [
        {
          id: 'core1-day1',
          title: 'Parachute Physics Introduction',
          description: 'Explore how parachutes work using simple demonstrations and videos',
          type: 'core',
          duration: '45 min',
          supportLevel: 'guided',
          objectives: [
            'Identify forces acting on falling objects',
            'Explain how air resistance affects falling speed',
            'Predict parachute design factors'
          ],
          resources: [
            { name: 'Physics of Parachutes Video', url: 'https://example.com/parachute-physics' },
            { name: 'Force Diagram Worksheet', url: '' }
          ]
        },
        {
          id: 'core2-day1',
          title: 'Time and Distance Basics',
          description: 'Learn measurement techniques for timing and distance',
          type: 'core',
          duration: '45 min',
          supportLevel: 'collaborative',
          objectives: [
            'Use stopwatch for accurate timing',
            'Measure distances using rulers and tape measures',
            'Record data in organized tables'
          ],
          resources: [
            { name: 'Measurement Tools Guide', url: '' },
            { name: 'Data Collection Sheet', url: '' }
          ]
        },
        {
          id: 'core3-day1',
          title: 'Parachute Design Challenge',
          description: 'Design and sketch initial parachute concepts',
          type: 'core',
          duration: '45 min',
          supportLevel: 'independent',
          objectives: [
            'Brainstorm parachute design variations',
            'Create detailed design sketches',
            'Justify design choices using physics concepts'
          ],
          resources: [
            { name: 'Design Template', url: '' },
            { name: 'Material Properties Chart', url: '' }
          ]
        }
      ]
    },
    {
      day: 2,
      title: 'Build and Test',
      description: 'Construct parachutes and conduct initial drop tests',
      estimatedTime: '3 hours',
      blocks: [
        {
          id: 'core1-day2',
          title: 'Parachute Construction',
          description: 'Build parachutes using selected materials and designs',
          type: 'core',
          duration: '60 min',
          supportLevel: 'collaborative',
          objectives: [
            'Follow safety protocols during construction',
            'Assemble parachute components accurately',
            'Test structural integrity before drops'
          ],
          resources: [
            { name: 'Construction Guide', url: '' },
            { name: 'Safety Checklist', url: '' }
          ]
        },
        {
          id: 'core2-day2',
          title: 'Initial Drop Tests',
          description: 'Conduct first round of parachute drop experiments',
          type: 'core',
          duration: '45 min',
          supportLevel: 'guided',
          objectives: [
            'Execute controlled drop tests',
            'Collect timing and distance data',
            'Observe parachute behavior during flight'
          ],
          resources: [
            { name: 'Test Protocol', url: '' },
            { name: 'Observation Sheet', url: '' }
          ]
        },
        {
          id: 'extension1-day2',
          title: 'Design Modifications',
          description: 'Analyze results and modify parachute designs',
          type: 'extension',
          duration: '30 min',
          supportLevel: 'independent',
          objectives: [
            'Identify design improvements based on test results',
            'Implement modifications to parachute',
            'Predict impact of changes on performance'
          ],
          resources: [
            { name: 'Modification Guide', url: '' }
          ]
        }
      ]
    },
    {
      day: 3,
      title: 'Data Analysis',
      description: 'Analyze test results and explore patterns in data',
      estimatedTime: '3 hours',
      blocks: [
        {
          id: 'core1-day3',
          title: 'Data Organization',
          description: 'Organize and graph experimental data',
          type: 'core',
          duration: '45 min',
          supportLevel: 'collaborative',
          objectives: [
            'Create data tables and charts',
            'Calculate averages and ranges',
            'Identify trends in the data'
          ],
          resources: [
            { name: 'Graphing Template', url: '' },
            { name: 'Calculator Guide', url: '' }
          ]
        },
        {
          id: 'core2-day3',
          title: 'Pattern Recognition',
          description: 'Identify relationships between design and performance',
          type: 'core',
          duration: '45 min',
          supportLevel: 'guided',
          objectives: [
            'Compare different parachute designs',
            'Explain performance differences',
            'Make predictions for new designs'
          ],
          resources: [
            { name: 'Comparison Chart', url: '' }
          ]
        }
      ]
    },
    {
      day: 4,
      title: 'Optimization',
      description: 'Refine designs and conduct final testing',
      estimatedTime: '3 hours',
      blocks: [
        {
          id: 'core1-day4',
          title: 'Design Optimization',
          description: 'Create improved parachute designs based on learning',
          type: 'core',
          duration: '60 min',
          supportLevel: 'independent',
          objectives: [
            'Apply learning to create optimized designs',
            'Build improved parachute prototypes',
            'Predict performance improvements'
          ],
          resources: [
            { name: 'Optimization Checklist', url: '' }
          ]
        },
        {
          id: 'core2-day4',
          title: 'Final Testing',
          description: 'Conduct final drop tests with optimized designs',
          type: 'core',
          duration: '45 min',
          supportLevel: 'collaborative',
          objectives: [
            'Execute final testing protocol',
            'Document final performance data',
            'Compare with initial results'
          ],
          resources: [
            { name: 'Final Test Protocol', url: '' }
          ]
        }
      ]
    },
    {
      day: 5,
      title: 'Reflection & Presentation',
      description: 'Reflect on learning and share results with family',
      estimatedTime: '3 hours',
      blocks: [
        {
          id: 'core1-day5',
          title: 'Learning Reflection',
          description: 'Reflect on the learning process and key discoveries',
          type: 'core',
          duration: '45 min',
          supportLevel: 'independent',
          objectives: [
            'Articulate key learning from the week',
            'Identify challenges and how they were overcome',
            'Connect learning to real-world applications'
          ],
          resources: [
            { name: 'Reflection Template', url: '' }
          ]
        },
        {
          id: 'core2-day5',
          title: 'Family Presentation',
          description: 'Present findings and demonstrations to family members',
          type: 'core',
          duration: '60 min',
          supportLevel: 'collaborative',
          objectives: [
            'Explain parachute physics to others',
            'Demonstrate best-performing designs',
            'Share learning journey and insights'
          ],
          resources: [
            { name: 'Presentation Guide', url: '' }
          ]
        }
      ]
    }
  ],
  materials: [
    {
      id: 'mat1',
      name: 'Plastic bags or lightweight fabric',
      quantity: '10-15 pieces',
      category: 'Basic Materials',
      description: 'Various sizes for parachute canopies',
      alternatives: ['Tissue paper', 'Newspaper', 'Coffee filters']
    },
    {
      id: 'mat2',
      name: 'String or yarn',
      quantity: '5 meters',
      category: 'Basic Materials',
      description: 'For parachute lines and connections',
      alternatives: ['Thread', 'Dental floss', 'Thin rope']
    },
    {
      id: 'mat3',
      name: 'Small weights',
      quantity: '20-30 pieces',
      category: 'Basic Materials',
      description: 'Coins, washers, or small toys as payload',
      alternatives: ['Paperclips', 'Small stones', 'Modeling clay']
    },
    {
      id: 'mat4',
      name: 'Tape',
      quantity: '2 rolls',
      category: 'Basic Materials',
      description: 'For securing connections and reinforcement',
      alternatives: ['Glue', 'Stapler', 'Paper clips']
    },
    {
      id: 'mat5',
      name: 'Scissors',
      quantity: '2-3 pairs',
      category: 'Basic Materials',
      description: 'For cutting materials to size'
    },
    {
      id: 'mat6',
      name: 'Stopwatch or timer',
      quantity: '2-3 devices',
      category: 'Measurement Tools',
      description: 'For timing parachute drops',
      alternatives: ['Smartphone timer', 'Kitchen timer']
    },
    {
      id: 'mat7',
      name: 'Measuring tape or ruler',
      quantity: '2 pieces',
      category: 'Measurement Tools',
      description: 'For measuring distances and dimensions',
      alternatives: ['Yardstick', 'Long ruler']
    },
    {
      id: 'mat8',
      name: 'Notebook and pencils',
      quantity: '1 per learner',
      category: 'Measurement Tools',
      description: 'For recording data and observations'
    },
    {
      id: 'mat9',
      name: 'Safety glasses',
      quantity: '1 per person',
      category: 'Safety Equipment',
      description: 'Eye protection during testing'
    },
    {
      id: 'mat10',
      name: 'First aid kit',
      quantity: '1 kit',
      category: 'Safety Equipment',
      description: 'Basic medical supplies for minor injuries'
    },
    {
      id: 'mat11',
      name: 'Colored markers or crayons',
      quantity: '1 set',
      category: 'Optional Enhancements',
      description: 'For decorating parachutes and creating diagrams'
    },
    {
      id: 'mat12',
      name: 'Camera or smartphone',
      quantity: '1 device',
      category: 'Optional Enhancements',
      description: 'For documenting experiments and results'
    }
  ],
  safetyProtocols: [
    'Always wear safety glasses during construction and testing activities',
    'Adult supervision required for all drop tests from elevated positions',
    'Ensure drop zone is clear of people and obstacles before testing',
    'Use only designated testing areas - never drop from windows or balconies',
    'Keep first aid kit accessible during all activities',
    'Check weather conditions - avoid testing in strong winds or rain',
    'Inspect all materials for sharp edges or potential hazards before use',
    'Establish clear boundaries for testing area and ensure all participants stay outside drop zone',
    'Have emergency contact information readily available',
    'Stop activity immediately if anyone feels unsafe or uncomfortable'
  ],
  frenchVocabulary: [
    { term: 'parachute', translation: 'le parachute', pronunciation: 'luh par-ah-SHOOT' },
    { term: 'gravity', translation: 'la gravité', pronunciation: 'lah grah-vee-TAY' },
    { term: 'air resistance', translation: 'la résistance de l\'air', pronunciation: 'lah ray-zees-TAHNSS duh lair' },
    { term: 'experiment', translation: 'l\'expérience', pronunciation: 'lex-pay-ree-AHNSS' },
    { term: 'measurement', translation: 'la mesure', pronunciation: 'lah muh-ZOOR' },
    { term: 'design', translation: 'la conception', pronunciation: 'lah kon-sep-SYOHN' },
    { term: 'test', translation: 'le test', pronunciation: 'luh test' },
    { term: 'data', translation: 'les données', pronunciation: 'lay don-NAY' },
    { term: 'speed', translation: 'la vitesse', pronunciation: 'lah vee-TESS' },
    { term: 'time', translation: 'le temps', pronunciation: 'luh tahn' }
  ]
};
