import { TranslationDictionary } from '../LanguageProvider';
export const hi: TranslationDictionary = {
  landing: {
    title: "उत्पाद लेबल को अनुपालन निर्णयों में बदलें।",
    subtitle: "LabelGuard पैकेज्ड कमोडिटीज को तेज़ी से और अधिक आत्मविश्वास के साथ सत्यापित करने के लिए OCR, विधिक माप विज्ञान (Legal Metrology) नियमों और सुरक्षित साक्ष्य वर्कफ़्लो का उपयोग करता है।",
    badge: "विधिक माप विज्ञान अनुपालन प्रवर्तन",
    nav: { howItWorks: "यह कैसे काम करता है", features: "प्लेटफ़ॉर्म की विशेषताएँ", demo: "इंटरैक्टिव डेमो", security: "GovTech सुरक्षा" },
    buttons: { controlRoom: "कंट्रोल रूम", inspectorSignIn: "निरीक्षक साइन-इन", startScan: "स्कैन शुरू करें", getAccess: "पहुँच प्राप्त करें", startInspection: "निरीक्षण शुरू करें", explorePlatform: "प्लेटफ़ॉर्म का अन्वेषण करें" }
  },
  navigation: { dashboard: "डैशबोर्ड", scanLabel: "लेबल स्कैन करें", repository: "निरीक्षण रिपॉजिटरी", reviewQueue: "समीक्षा कतार", navigationHeading: "नेविगेशन", signOut: "साइन आउट करें", accessRestricted: "पहुँच प्रतिबंधित है", inspectionReport: "निरीक्षण रिपोर्ट" },
  scan: {
    title: "उत्पाद लेबल स्कैन करें",
    subtitle: "घोषणाओं को स्वचालित रूप से निकालने और अनुपालन जांचने के लिए एक लेबल फ़ोटो अपलोड करें।",
    steps: { upload: "लेबल अपलोड करें", analyzing: "AI OCR स्कैन", review: "OCR समीक्षा", checklist: "नियम 6 जाँच", submit: "सबमिट करें" },
    status: { ready: "स्थिति: तैयार", scanning: "स्थिति: स्कैन हो रहा है", extraction: "स्थिति: डेटा निकाला जा रहा है", evaluating: "स्थिति: मूल्यांकन हो रहा है", reportReady: "स्थिति: रिपोर्ट तैयार" },
    upload: { dragAndDrop: "उत्पाद लेबल की छवि को यहाँ खींचें और छोड़ें", clickToBrowse: "या ब्राउज़ करने के लिए क्लिक करें", supportTypes: "JPEG, PNG, WEBP (5MB तक) का समर्थन करता है" },
    review: { title: "OCR निष्कर्षण समीक्षा", imported: "क्या यह एक आयातित उत्पाद है?", productName: "उत्पाद का नाम", missingFields: "लापता फ़ील्ड की समीक्षा करें", confirm: "निष्कर्षण की पुष्टि करें" },
    submitPanel: { success: "निरीक्षण पूर्ण!", savedToRepo: "आपका निरीक्षण रिपॉजिटरी में सहेज लिया गया है।", scanAnother: "एक और लेबल स्कैन करें", submittedReview: "समीक्षा के लिए प्रस्तुत किया गया", submittedViolations: "प्रस्तुत - उल्लंघन चिह्नित", subtext: "प्रस्तुत किया गया है। एक प्रवर्तन अधिकारी इस निरीक्षण को सत्यापित करेगा।", idUnavailable: "निरीक्षण आईडी अनुपलब्ध है। कृपया पुनः प्रयास करें या रिपॉजिटरी से निरीक्षण खोलें।", declarationsPassed: "घोषणाएँ पारित", violationsFound: "उल्लंघन मिले", status: "स्थिति", pendingReview: "समीक्षा लंबित", flaggedClauses: "चिह्नित खंड", viewReport: "निरीक्षण रिपोर्ट देखें" }
  },
  compliance: {
    rule6Evaluation: "नियम 6 मूल्यांकन",
    compliant: "अनुपालन",
    reviewRequired: "समीक्षा आवश्यक",
    pendingInspection: "निरीक्षण लंबित है",
    waiting: "प्रतीक्षा में",
    saveDraft: "ड्राफ्ट सहेजें",
    submitForReview: "समीक्षा के लिए सबमिट करें",
    ruleDescription: "नियम का विवरण",
    extractedValue: "निकाला गया मूल्य",
    status: "स्थिति"
  },
  repository: {
    title: "निरीक्षण रिपॉजिटरी",
    search: "निरीक्षण खोजें...",
    noInspections: "कोई निरीक्षण नहीं मिला।",
    filters: { all: "सभी", draft: "ड्राफ्ट", pending: "समीक्षा लंबित", compliant: "अनुपालन", nonCompliant: "गैर-अनुपालन" },
    table: { id: "आईडी", date: "तारीख", product: "उत्पाद", status: "स्थिति", actions: "क्रियाएँ" }
  },
  dashboard: {
    title: "डैशबोर्ड",
    totalInspections: "कुल निरीक्षण",
    compliant: "अनुपालन",
    nonCompliant: "गैर-अनुपालन",
    pendingReview: "समीक्षा लंबित",
    recentActivity: "हाल की गतिविधि"
  },
  reviewQueue: {
    title: "समीक्षा कतार",
    approve: "मंज़ूर करें",
    reject: "अस्वीकार करें",
    noPending: "समीक्षा के लिए कोई लंबित निरीक्षण नहीं है।"
  }
};
