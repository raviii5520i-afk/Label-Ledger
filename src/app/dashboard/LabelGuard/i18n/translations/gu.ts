import { TranslationDictionary } from '../LanguageProvider';
export const gu: TranslationDictionary = {
  landing: {
    title: "ઉત્પાદન લેબલોને અનુપાલન નિર્ણયોમાં ફેરવો.",
    subtitle: "LabelGuard પેકેજ્ડ કોમોડિટીઝને વધુ ઝડપથી અને વધુ આત્મવિશ્વાસ સાથે ચકાસવા માટે OCR, કાનૂની માપવિજ્ઞાન (Legal Metrology) નિયમો અને સુરક્ષિત પુરાવા વર્કફ્લોનો ઉપયોગ કરે છે.",
    badge: "કાનૂની માપવિજ્ઞાન અનુપાલન અમલીકરણ",
    nav: { howItWorks: "તે કેવી રીતે કાર્ય કરે છે", features: "પ્લેટફોર્મ સુવિધાઓ", demo: "ઇન્ટરેક્ટિવ ડેમો", security: "GovTech સુરક્ષા" },
    buttons: { controlRoom: "કંટ્રોલ રૂમ", inspectorSignIn: "ઇન્સ્પેક્ટર સાઇન-ઇન", startScan: "સ્કેન શરૂ કરો", getAccess: "ઍક્સેસ મેળવો", startInspection: "નિરીક્ષણ શરૂ કરો", explorePlatform: "પ્લેટફોર્મનું અન્વેષણ કરો" }
  },
  navigation: { dashboard: "ડેશબોર્ડ", scanLabel: "લેબલ સ્કેન કરો", repository: "નિરીક્ષણ રિપોઝીટરી", reviewQueue: "સમીક્ષા કતાર", navigationHeading: "નેવિગેશન", signOut: "સાઇન આઉટ કરો", accessRestricted: "ઍક્સેસ પ્રતિબંધિત છે", inspectionReport: "નિરીક્ષણ રિપોર્ટ" },
  scan: {
    title: "ઉત્પાદન લેબલ સ્કેન કરો",
    subtitle: "ઘોષણાઓને આપમેળે કાઢવા અને અનુપાલન ચકાસવા માટે લેબલનો ફોટો અપલોડ કરો.",
    steps: { upload: "લેબલ અપલોડ કરો", analyzing: "AI OCR સ્કેન", review: "OCR સમીક્ષા", checklist: "નિયમ 6 તપાસ", submit: "સબમિટ કરો" },
    status: { ready: "સ્થિતિ: તૈયાર", scanning: "સ્થિતિ: સ્કેન થઈ રહ્યું છે", extraction: "સ્થિતિ: ડેટા કાઢવામાં આવી રહ્યો છે", evaluating: "સ્થિતિ: મૂલ્યાંકન થઈ રહ્યું છે", reportReady: "સ્થિતિ: રિપોર્ટ તૈયાર" },
    upload: { dragAndDrop: "ઉત્પાદન લેબલની છબી અહીં ખેંચો અને છોડો", clickToBrowse: "અથવા બ્રાઉઝ કરવા માટે ક્લિક કરો", supportTypes: "JPEG, PNG, WEBP (5MB સુધી) ને સપોર્ટ કરે છે" },
    review: { title: "OCR નિષ્કર્ષણ સમીક્ષા", imported: "શું આ આયાતી ઉત્પાદન છે?", productName: "ઉત્પાદનનું નામ", missingFields: "ગુમ થયેલ ક્ષેત્રોની સમીક્ષા કરો", confirm: "નિષ્કર્ષણની પુષ્ટિ કરો" },
    submitPanel: { success: "નિરીક્ષણ પૂર્ણ!", savedToRepo: "તમારું નિરીક્ષણ રિપોઝીટરીમાં સાચવવામાં આવ્યું છે.", scanAnother: "બીજું લેબલ સ્કેન કરો", submittedReview: "સમીક્ષા માટે સબમિટ કર્યું", submittedViolations: "સબમિટ કર્યું - ઉલ્લંઘન નોંધાયેલ છે", subtext: "સબમિટ કરવામાં આવ્યું છે. અમલીકરણ અધિકારી આ નિરીક્ષણની ચકાસણી કરશે.", idUnavailable: "નિરીક્ષણ ID અનુપલબ્ધ છે. કૃપા કરીને ફરી પ્રયાસ કરો અથવા રિપોઝીટરીમાંથી નિરીક્ષણ ખોલો.", declarationsPassed: "જાહેરાતો પસાર થઈ", violationsFound: "ઉલ્લંઘન મળ્યાં", status: "સ્થિતિ", pendingReview: "સમીક્ષા બાકી", flaggedClauses: "ચિહ્નિત કલમો", viewReport: "નિરીક્ષણ રિપોર્ટ જુઓ" }
  },
  compliance: {
    rule6Evaluation: "નિયમ 6 મૂલ્યાંકન",
    compliant: "અનુરૂપ",
    reviewRequired: "સમીક્ષા આવશ્યક છે",
    pendingInspection: "નિરીક્ષણ બાકી છે",
    waiting: "રાહ જોઈ રહ્યા છીએ",
    saveDraft: "ડ્રાફ્ટ સાચવો",
    submitForReview: "સમીક્ષા માટે સબમિટ કરો",
    ruleDescription: "નિયમનું વર્ણન",
    extractedValue: "કાઢેલું મૂલ્ય",
    status: "સ્થિતિ"
  },
  repository: {
    title: "નિરીક્ષણ રિપોઝીટરી",
    search: "નિરીક્ષણો શોધો...",
    noInspections: "કોઈ નિરીક્ષણો મળ્યા નથી.",
    filters: { all: "બધા", draft: "ડ્રાફ્ટ", pending: "સમીક્ષા બાકી", compliant: "અનુરૂપ", nonCompliant: "બિન-અનુરૂપ" },
    table: { id: "આઈડી", date: "તારીખ", product: "ઉત્પાદન", status: "સ્થિતિ", actions: "ક્રિયાઓ" }
  },
  dashboard: {
    title: "ડેશબોર્ડ",
    totalInspections: "કુલ નિરીક્ષણો",
    compliant: "અનુરૂપ",
    nonCompliant: "બિન-અનુરૂપ",
    pendingReview: "સમીક્ષા બાકી છે",
    recentActivity: "તાજેતરની પ્રવૃત્તિ"
  },
  reviewQueue: {
    title: "સમીક્ષા કતાર",
    approve: "મંજૂર કરો",
    reject: "નકારો",
    noPending: "સમીક્ષા માટે કોઈ નિરીક્ષણો બાકી નથી."
  }
};
