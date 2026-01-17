# Post-Deployment Hackathon Checklist

Now that deployment is resolved, focus on **Presentation & Polish** for the Anveshana Hackathon.

## 1. 🔍 End-to-End Verification
- [ ] **College Search**: Verify search works with real Supabase data.
- [ ] **Career Simulation**: Run a full simulation flow (Student -> Interests -> Roadmap).
- [ ] **AI Chat**: Test "Career Coach" responsivness and context memory.

## 2. 💎 Feature Polish (Active Components)
- [ ] **Resume Builder**:
    - [ ] Test PDF download layout.
    - [ ] ensure `roadmap` data is correctly formatted in the PDF.
- [ ] **Mentor Match**:
    - [ ] Update mock data to match the user's selected career field (currently hardcoded static list).
    - [ ] Add "Connect" button feedback (e.g., "Request Sent" toast).
- [ ] **Skill Quiz**:
    - [ ] Persist quiz score to user profile (Supabase).
    - [ ] Use score to "adjust" the roadmap difficulty (visual change).

## 3. 🎨 UI/UX Refinement
- [ ] **Empty States**: Add friendly messages when no colleges/results found.
- [ ] **Loading States**: Verify the "Starburst" animation appears during AI generation.
- [ ] **Mobile Responsiveness**: Check layout on phone view (Chrome DevTools).

## 5. 🎤 Voice Integration (New!)
- [ ] **Voice Input**: Add microphone button to Chat Assistant (Web Speech API).
- [ ] **Voice Output**: Add 'Listen' button to AI responses (Text-to-Speech).
- [ ] **Interview Mode**: Simluated voice interview for the "Simulation" phase.

## 6. 📝 Documentation & Pitch
- [ ] **Demo Script**: Write a script for the 2-minute hackathon pitch.
- [ ] **Screenshots**: Take high-res screenshots for the submission page.
