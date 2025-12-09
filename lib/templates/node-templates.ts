export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'main_story' | 'side_quest' | 'tutorial' | 'ending';
  content_html: string;
  suggestedConditions: {
    type: string;
    description: string;
  }[];
  suggestedTargets: {
    type: string;
    description: string;
    htmlSnippet?: string; // Ora opzionale
  }[];
  suggestedEffects: {
    type: string;
    description: string;
  }[];
}

export const nodeTemplates: NodeTemplate[] = [
  {
    id: 'simple-side-quest',
    name: '🎯 Simple Side Quest',
    description: 'Quest con singolo obiettivo da completare',
    category: 'side_quest',
    content_html: `<div class="quest-container">
  <h2>{{QUEST_TITLE}}</h2>
  <p>{{QUEST_DESCRIPTION}}</p>
  
  <div class="objective">
    <h3>Obiettivo:</h3>
    <p>{{OBJECTIVE_TEXT}}</p>
  </div>
  
  <button onclick="submitTargetCode('{{TARGET_ID}}', 'COMPLETION_CODE')">
    Completa Quest
  </button>
</div>`,
    suggestedConditions: [
      {
        type: 'node_completion',
        description: 'Completamento di un node precedente'
      }
    ],
    suggestedTargets: [
      {
        type: 'code_entry',
        description: 'Codice di completamento',
        htmlSnippet: `<button onclick="submitTargetCode('TARGET_ID', 'YOUR_CODE')">Completa</button>`
      }
    ],
    suggestedEffects: [
      {
        type: 'experience_gain',
        description: 'Ricompensa XP (es: 100 punti)'
      },
      {
        type: 'item_gain',
        description: 'Ricompensa item'
      }
    ]
  },
  {
    id: 'collection-quest',
    name: '📦 Collection Quest',
    description: 'Raccogli N oggetti scansionando QR codes',
    category: 'side_quest',
    content_html: `<div class="quest-container">
  <h2>{{QUEST_TITLE}}</h2>
  <p>{{QUEST_DESCRIPTION}}</p>
  
  <div class="collection-tracker">
    <h3>Oggetti da raccogliere:</h3>
    <ul>
      <li>{{ITEM_1_NAME}}</li>
      <li>{{ITEM_2_NAME}}</li>
      <li>{{ITEM_3_NAME}}</li>
    </ul>
  </div>
  
  <p class="hint">Scansiona i QR codes degli oggetti usando il pulsante "Raccogli" nell'inventario.</p>
  
  <button onclick="submitTargetCode('{{TARGET_ID}}', 'COLLECTED_ALL')">
    Verifica Completamento
  </button>
</div>`,
    suggestedConditions: [
      {
        type: 'node_completion',
        description: 'Node introduttivo completato'
      }
    ],
    suggestedTargets: [
      {
        type: 'inventory_check',
        description: 'Possesso di tutti gli item richiesti'
      }
    ],
    suggestedEffects: [
      {
        type: 'experience_gain',
        description: 'Ricompensa XP (es: 200 punti)'
      },
      {
        type: 'achievement_unlock',
        description: 'Achievement "Collezionista"'
      }
    ]
  },
  {
    id: 'gps-exploration',
    name: '🗺️ GPS Exploration',
    description: 'Raggiungi una location fisica',
    category: 'side_quest',
    content_html: `<div class="quest-container">
  <h2>{{QUEST_TITLE}}</h2>
  <p>{{QUEST_DESCRIPTION}}</p>
  
  <div class="location-info">
    <h3>Destinazione:</h3>
    <p>{{LOCATION_NAME}}</p>
    <p class="coordinates">Coordinate: {{LATITUDE}}, {{LONGITUDE}}</p>
  </div>
  
  <button onclick="requestGeolocation('{{TARGET_ID}}')">
    📍 Verifica Posizione
  </button>
</div>`,
    suggestedConditions: [
      {
        type: 'node_completion',
        description: 'Node precedente completato'
      }
    ],
    suggestedTargets: [
      {
        type: 'gps_location',
        description: 'Posizione GPS target (lat, lng, raggio)',
        htmlSnippet: `<button onclick="requestGeolocation('TARGET_ID')">📍 Verifica Posizione</button>`
      }
    ],
    suggestedEffects: [
      {
        type: 'experience_gain',
        description: 'Ricompensa XP (es: 150 punti)'
      },
      {
        type: 'node_unlock',
        description: 'Sblocca prossimo node nella catena'
      }
    ]
  },
  {
    id: 'multi-step-main',
    name: '📖 Multi-Step Main Story',
    description: 'Chapter principale con più fasi',
    category: 'main_story',
    content_html: `<div class="story-container">
  <h1>{{CHAPTER_TITLE}}</h1>
  
  <div class="story-content">
    <p>{{STORY_INTRO}}</p>
    
    <div class="phase-1">
      <h3>Fase 1: {{PHASE_1_TITLE}}</h3>
      <p>{{PHASE_1_TEXT}}</p>
      <button onclick="submitTargetCode('target_phase1', 'PHASE1_CODE')">
        Completa Fase 1
      </button>
    </div>
    
    <div class="phase-2" style="display:none;" id="phase2">
      <h3>Fase 2: {{PHASE_2_TITLE}}</h3>
      <p>{{PHASE_2_TEXT}}</p>
      <button onclick="submitTargetCode('target_phase2', 'PHASE2_CODE')">
        Completa Fase 2
      </button>
    </div>
    
    <div class="phase-3" style="display:none;" id="phase3">
      <h3>Fase Finale: {{PHASE_3_TITLE}}</h3>
      <p>{{PHASE_3_TEXT}}</p>
      <button onclick="submitTargetCode('target_final', 'FINAL_CODE')">
        Completa Chapter
      </button>
    </div>
  </div>
  
  <script>
    // Mostra le fasi progressivamente quando vengono completate
    // (questo è gestito dalle target validations)
  </script>
</div>`,
    suggestedConditions: [
      {
        type: 'node_completion',
        description: 'Chapter precedente completato'
      },
      {
        type: 'experience_threshold',
        description: 'Livello minimo richiesto'
      }
    ],
    suggestedTargets: [
      {
        type: 'code_entry',
        description: 'Codice fase 1',
        htmlSnippet: `<button onclick="submitTargetCode('TARGET_ID', 'CODE_HERE')">Completa</button>`
      },
      {
        type: 'code_entry',
        description: 'Codice fase 2'
      },
      {
        type: 'code_entry',
        description: 'Codice finale'
      }
    ],
    suggestedEffects: [
      {
        type: 'experience_gain',
        description: 'Ricompensa XP maggiore (es: 500 punti)'
      },
      {
        type: 'node_unlock',
        description: 'Sblocca prossimo chapter'
      },
      {
        type: 'item_gain',
        description: 'Item di storia chiave'
      }
    ]
  },
  {
    id: 'tutorial-basic',
    name: '🎓 Basic Tutorial',
    description: 'Tutorial per meccaniche di gioco',
    category: 'tutorial',
    content_html: `<div class="tutorial-container">
  <h2>Tutorial: {{MECHANIC_NAME}}</h2>
  
  <div class="tutorial-steps">
    <h3>Come funziona:</h3>
    <ol>
      <li>{{STEP_1}}</li>
      <li>{{STEP_2}}</li>
      <li>{{STEP_3}}</li>
    </ol>
  </div>
  
  <div class="try-it">
    <h3>Prova tu!</h3>
    <p>{{PRACTICE_INSTRUCTION}}</p>
    <button onclick="submitTargetCode('{{TARGET_ID}}', 'TUTORIAL_COMPLETE')">
      Ho capito!
    </button>
  </div>
</div>`,
    suggestedConditions: [],
    suggestedTargets: [
      {
        type: 'code_entry',
        description: 'Conferma comprensione',
        htmlSnippet: `<button onclick="submitTargetCode('TARGET_ID', 'UNDERSTOOD')">Ho capito!</button>`
      }
    ],
    suggestedEffects: [
      {
        type: 'experience_gain',
        description: 'XP minimo (es: 50 punti)'
      }
    ]
  },
  {
    id: 'blank',
    name: '📄 Blank Node',
    description: 'Node vuoto da personalizzare completamente',
    category: 'main_story',
    content_html: `<div class="custom-container">
  <h2>{{TITLE}}</h2>
  <p>{{CONTENT}}</p>
</div>`,
    suggestedConditions: [],
    suggestedTargets: [],
    suggestedEffects: []
  }
];

export function getTemplate(id: string): NodeTemplate | undefined {
  return nodeTemplates.find(t => t.id === id);
}