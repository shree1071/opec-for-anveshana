from .patterns import PATTERNS

def match_patterns(student_history):
    """
    Analyze message history to find active patterns.
    student_history: list of dicts with 'signals' key.
    """
    detected_patterns = []
    
    # Aggregate signals
    totals = {}
    for msg in student_history:
        signals = msg.get('signals', {})
        if signals is None:
            signals = {}
        for signal_name, score in signals.items():
            # Assume score is 0-10. We count occurrences where score > 3
            if score > 3:
                totals[signal_name] = totals.get(signal_name, 0) + 1
                
    # Check against pattern definitions
    for pid, p_def in PATTERNS.items():
        count = 0
        for sig in p_def['signals']:
            count += totals.get(sig, 0)
            
        if count >= p_def['threshold']:
            # Pattern is active
            detected_patterns.append({
                "id": pid,
                "name": p_def['name'],
                "intervention_template": p_def['intervention_template'].format(count=count),
                "confidence": min(1.0, count / p_def['threshold'])
            })
            
    return detected_patterns
