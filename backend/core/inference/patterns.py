PATTERNS = {
    "external_pressure": {
        "id": "external_pressure",
        "name": "External Pressure Override",
        "intervention_template": "I'm noticing you've mentioned what others want {count} times. If no one else had an opinion, what would YOU choose?",
        "signals": ["external_pressure", "obligation_language"],
        "threshold": 4
    },
    "decision_paralysis": {
        "id": "decision_paralysis",
        "name": "Decision Paralysis",
        "intervention_template": "You're stuck in analysis mode. Let's pick ONE option to explore deeply for a week.",
        "signals": ["circular_thinking", "indecision_markers"],
        "threshold": 5
    },
    "identity_confusion": {
        "id": "identity_confusion",
        "name": "Identity Confusion",
        "intervention_template": "You seem unsure about who you are vs who you should be. Tell me about a time you lost track of time doing something.",
        "signals": ["identity_uncertainty", "comparison_to_others"],
        "threshold": 6
    },
    "sunk_cost": {
         "id": "sunk_cost",
         "name": "Sunk Cost Trap",
         "intervention_template": "You're worrying about time 'wasted'. The past is gone. What choice serves your FUTURE?",
         "signals": ["past_investment"],
         "threshold": 3
    }
}
