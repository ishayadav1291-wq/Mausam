import { LanguageCode, PersonaId } from '../types';

export interface PersonaTranslation {
  name: string;
  cardTitle: string;
  tagline: string;
  description: string;
}

export interface TranslationStrings {
  offlineBanner: string;
  becauseYouFollow: string;
  liveBadge: string;
  personas: Record<PersonaId, PersonaTranslation>;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationStrings> = {
  en: {
    offlineBanner: 'Offline Mode: Displaying cached local weather predictions and advisories.',
    becauseYouFollow: 'Because you follow',
    liveBadge: 'LIVE',
    personas: {
      health: {
        name: 'Health',
        cardTitle: 'Air Quality & UV Safety',
        tagline: 'Air quality, dust allergens & UV protection',
        description: 'Real-time air pollution metrics, pollen forecasts, UV index advisories and respirator safety recommendations.'
      },
      fitness: {
        name: 'Fitness',
        cardTitle: 'Workout & Running Windows',
        tagline: 'Best running hours, thermal strain & stamina',
        description: 'Optimized morning and evening workout slots, hydration guides and heat-index monitoring.'
      },
      beach: {
        name: 'Beach',
        cardTitle: 'Coastal Weather & Tides',
        tagline: 'Tidal currents, water temperature & wave height',
        description: 'Real-time wave reports, high and low tide timetables, rip-current warnings and coastal wind data.'
      },
      traveller: {
        name: 'Travel',
        cardTitle: 'Transit & Packing Advisory',
        tagline: 'Destination weather, packing checklist & delay risks',
        description: 'Packing checklists, en-route weather turbulence, destination forecasts and precipitation risk.'
      },
      parent: {
        name: 'Family',
        cardTitle: 'School Hours & Child Protection',
        tagline: 'School commute, rain forecasts & playground safety',
        description: 'School bus pick-up and drop weather alerts, rainstorm warnings and pediatric temperature advisories.'
      },
      agriculture: {
        name: 'Farming',
        cardTitle: 'Agronomy & Crop Advisories',
        tagline: 'Soil moisture, irrigation schedules & pest risk',
        description: 'ICAR-backed crop advisories, evapotranspiration indices, spray conditions and sowing recommendations.'
      },
      commuter: {
        name: 'Commute',
        cardTitle: 'Traffic Weather & Road Safety',
        tagline: 'Road visibility, flood waterlogging & highway alerts',
        description: 'Fog visibility distance, road slickness warnings, expressway delay estimates and transit alerts.'
      },
      events: {
        name: 'Events',
        cardTitle: 'Outdoor Gatherings & Suitability',
        tagline: '14-day comfort index, rain likelihood & golden hour',
        description: 'Event suitability ratings, marquee wind resistance forecasts and golden hour timing.'
      }
    }
  },
  hi: {
    offlineBanner: 'ऑफ़लाइन मोड: कैश्ड स्थानीय मौसम पूर्वानुमान और सलाह प्रदर्शित की जा रही है।',
    becauseYouFollow: 'क्योंकि आप अनुसरण करते हैं',
    liveBadge: 'लाइव',
    personas: {
      health: {
        name: 'स्वास्थ्य',
        cardTitle: 'वायु गुणवत्ता एवं पराबैंगनी सुरक्षा',
        tagline: 'वायु गुणवत्ता, परागकण एवं यूवी सुरक्षा',
        description: 'वास्तविक समय वायु प्रदूषण सूचकांक, पराग पूर्वानुमान और स्वास्थ्य सुरक्षा सलाह।'
      },
      fitness: {
        name: 'फिटनेस',
        cardTitle: 'व्यायाम एवं दौड़ने का अनुकूल समय',
        tagline: 'दौड़ने का सर्वोत्तम समय एवं तापीय सूचकांक',
        description: 'सुबह और शाम के कसरत समय, जलयोजन मार्गदर्शन और हीट इंडेक्स ट्रैकिंग।'
      },
      beach: {
        name: 'तटीय व समुद्र',
        cardTitle: 'समुद्री मौसम एवं ज्वार-भाटा',
        tagline: 'ज्वार की स्थिति, जल तापमान एवं लहरें',
        description: 'समुद्री लहरों की ऊंचाई, ज्वार-भाटा समय सारिणी और सुरक्षित तैराकी सलाह।'
      },
      traveller: {
        name: 'यात्रा',
        cardTitle: 'यात्रा मौसम एवं पैकिंग चेकलिस्ट',
        tagline: 'गंतव्य मौसम एवं यात्रा संबंधी सुझाव',
        description: 'गंतव्य मौसम पूर्वानुमान, पैकिंग चेकलिस्ट और परिवहन जोखिम समीक्षा।'
      },
      parent: {
        name: 'परिवार व बच्चे',
        cardTitle: 'स्कूल समय एवं बाल सुरक्षा मौसम',
        tagline: 'स्कूल आवागमन, वर्षा चेतावनी व सुरक्षा',
        description: 'स्कूल आने-जाने के समय वर्षा चेतावनी और बच्चों के लिए मौसम संबंधी सावधानियां।'
      },
      agriculture: {
        name: 'कृषि व किसान',
        cardTitle: 'फसल मौसम एवं सिंचाई सलाह',
        tagline: 'मृदा नमी, मौसम सलाह एवं कीट निगरानी',
        description: 'कृषि मौसम सलाह, समय पर कीटनाशक छिड़काव और सिंचाई योजना।'
      },
      commuter: {
        name: 'दैनिक यात्रा',
        cardTitle: 'सड़क दृश्यता एवं यातायात अलर्ट',
        tagline: 'दृश्यता, जलभराव एवं मार्ग की स्थिति',
        description: 'कोहरा दृश्यता, एक्सप्रेसवे अलर्ट और बारिश में जलभराव की स्थिति।'
      },
      events: {
        name: 'आयोजन व उत्सव',
        cardTitle: 'खुले मैदान में आयोजन मौसम',
        tagline: '14-दिवसीय मौसम अनुकूलता एवं वर्षा जोखिम',
        description: 'विवाह व उत्सवों के लिए मौसम उपयुक्तता स्कोर और वर्षा पूर्वानुमान।'
      }
    }
  },
  mr: {
    offlineBanner: 'ऑफलाइन मोड: सेव्ह केलेले स्थानिक हवामान अंदाज दाखवले जात आहेत.',
    becauseYouFollow: 'कारण आपण फॉलो करत आहात',
    liveBadge: 'थेट',
    personas: {
      health: {
        name: 'आरोग्य',
        cardTitle: 'हवेची गुणवत्ता आणि यूव्ही संरक्षण',
        tagline: 'हवेची गुणवत्ता आणि परागकण संरक्षण',
        description: 'रिअल-टाइम हवा प्रदूषण निर्देशांक आणि आरोग्य सल्ला.'
      },
      fitness: {
        name: 'फिटनेस',
        cardTitle: 'व्यायामाची योग्य वेळ',
        tagline: 'धावण्यासाठी उत्तम वेळ आणि हवामान',
        description: 'सकाळ आणि संध्याकाळच्या व्यायामाची वेळ आणि हायड्रेशन सल्ला.'
      },
      beach: {
        name: 'समुद्रकिनारा',
        cardTitle: 'भरती-ओहोटी आणि लाटांचा अंदाज',
        tagline: 'भरती-ओहोटी, लाटांची उंची आणि समुद्र हवामान',
        description: 'लाटांची उंची, भरती-ओहोटीच्या वेळा आणि सुरक्षिततेच्या सूचना.'
      },
      traveller: {
        name: 'प्रवास',
        cardTitle: 'प्रवास हवामान आणि पॅकिंग चेकलिस्ट',
        tagline: 'प्रवास नियोजन आणि हवामान सूचना',
        description: 'गंतव्य हवामान अंदाज आणि प्रवासाची सुरक्षितता.'
      },
      parent: {
        name: 'कुटुंब',
        cardTitle: 'शाळेच्या वेळा आणि बाल सुरक्षा',
        tagline: 'शाळेचा प्रवास आणि पावसाचा इशारा',
        description: 'शाळेच्या वेळेतील हवामान आणि मुलांच्या आरोग्यासाठी मार्गदर्शन.'
      },
      agriculture: {
        name: 'शेती',
        cardTitle: 'शेती हवामान आणि पीक सल्ला',
        tagline: 'मातीतील ओलावा, सिंचन आणि कीड नियंत्रण',
        description: 'हवामानावर आधारित पीक संरक्षण आणि खत-पाणी व्यवस्थापन.'
      },
      commuter: {
        name: 'दळणवळण',
        cardTitle: 'वाहतूक हवामान आणि रस्ता सुरक्षा',
        tagline: 'धुके, रस्ता दृश्यमानता आणि वाहतूक कोंडी',
        description: 'रस्त्यावरील दृश्यमानता आणि पाणी साचण्याचा धोका.'
      },
      events: {
        name: 'समारंभ',
        cardTitle: 'मैदानी कार्यक्रम हवामान',
        tagline: 'कार्यक्रमांसाठी हवामानाची अनुकूलता',
        description: 'समारंभ, लग्न आणि मैदानी खेळांसाठी १४ दिवसांचा हवामान अंदाज.'
      }
    }
  },
  ta: {
    offlineBanner: 'ஆஃப்லைன் நிலை: தற்காலிக வானிலை கணிப்புகள் காண்பிக்கப்படுகின்றன.',
    becauseYouFollow: 'நீங்கள் பின்தொடர்வதால்',
    liveBadge: 'நேரலை',
    personas: {
      health: {
        name: 'சுகாதாரம்',
        cardTitle: 'காற்று தரம் & UV பாதுகாப்பு',
        tagline: 'காற்று தரம் மற்றும் ஒவ்வாமை முன்னெச்சரிக்கை',
        description: 'காற்று மாசுக் குறியீடு மற்றும் ஆரோக்கிய ஆலோசனைகள்.'
      },
      fitness: {
        name: 'உடற்பயிற்சி',
        cardTitle: 'உடற்பயிற்சிக்கு உகந்த நேரம்',
        tagline: 'ஓட்டப்பயிற்சிக்கான சிறந்த நேரம்',
        description: 'காலை மற்றும் மாலை நடைப்பயிற்சிக்கான உகந்த நேரங்கள்.'
      },
      beach: {
        name: 'கடற்கரை',
        cardTitle: 'அலைகள் மற்றும் கடல் வானிலை',
        tagline: 'அலை உயரம் மற்றும் அலைவு அட்டவணை',
        description: 'கடற்கரை காற்று, அலைகளின் நிலை மற்றும் எச்சரிக்கைகள்.'
      },
      traveller: {
        name: 'பயணம்',
        cardTitle: 'பயண வானிலை & பேக்கிங்',
        tagline: 'பயண வழிகாட்டி மற்றும் வானிலை',
        description: 'சேருமிடத்தின் வானிலை மற்றும் பயண முன்னெச்சரிக்கைகள்.'
      },
      parent: {
        name: 'குடும்பம்',
        cardTitle: 'பள்ளி நேரம் & குழந்தைகள் பாதுகாப்பு',
        tagline: 'மழை எச்சரிக்கை மற்றும் பாதுகாப்பு',
        description: 'பள்ளி நேர மழை கணிப்பு மற்றும் பாதுகாப்பு வழிகாட்டுதல்.'
      },
      agriculture: {
        name: 'விவசாயம்',
        cardTitle: 'பயிர் வானிலை & பாசன ஆலோசனை',
        tagline: 'மண் ஈரப்பதம் மற்றும் பயிர் பாதுகாப்பு',
        description: 'விவசாயத்திற்கான வானிலை முன்னறிவிப்பு மற்றும் பாசன ஆலோசனை.'
      },
      commuter: {
        name: 'பயணிகள்',
        cardTitle: 'போக்குவரத்து & சாலை பார்வை',
        tagline: 'பனிமூட்டம் மற்றும் சாலை பாதுகாப்பு',
        description: 'சாலை பார்வை தூரம் மற்றும் போக்குவரத்து நெரிசல் முன்னறிவிப்பு.'
      },
      events: {
        name: 'நிகழ்வுகள்',
        cardTitle: 'வெளிப்புற நிகழ்வுகள் வானிலை',
        tagline: '14 நாள் நிகழ்வு வானிலை கணிப்பு',
        description: 'நிகழ்ச்சிகளுக்கான வானிலை தகுதி மற்றும் மழை கணிப்பு.'
      }
    }
  },
  bn: {
    offlineBanner: 'অফলাইন মোড: সংরক্ষিত স্থানীয় আবহাওয়া পূর্বাভাস প্রদর্শিত হচ্ছে।',
    becauseYouFollow: 'কারণ আপনি অনুসরণ করছেন',
    liveBadge: 'সরাসরি',
    personas: {
      health: {
        name: 'স্বাস্থ্য',
        cardTitle: 'বাতাসের মান ও ইউভি সুরক্ষা',
        tagline: 'বায়ুর মান ও এলার্জি পূর্বাভাস',
        description: 'রিয়েল-টাইম এয়ার কোয়ালিটি ইনডেক্স ও স্বাস্থ্য সুরক্ষা নির্দেশিকা।'
      },
      fitness: {
        name: 'ফিটনেস',
        cardTitle: 'ব্যায়ামের উপযুক্ত সময়',
        tagline: 'দৌড়ানো ও ব্যায়ামের আদর্শ সময়',
        description: 'সকাল ও সন্ধ্যার অনুকূল সময় এবং আর্দ্রতা পর্যবেক্ষণ।'
      },
      beach: {
        name: 'সমুদ্র উপকূল',
        cardTitle: 'জোয়ার-ভাটা ও ঢেউয়ের উচ্চতা',
        tagline: 'উপকূলীয় আবহাওয়া ও ঢেউয়ের পূর্বাভাস',
        description: 'সমুদ্র সৈকতের আবহাওয়া, জোয়ার-ভাটা এবং সাঁতারের সতর্কতা।'
      },
      traveller: {
        name: 'ভ্রমণ',
        cardTitle: 'ভ্রমণ আবহাওয়া ও প্যাকিং তালিকা',
        tagline: 'গন্তব্যের পূর্বাভাস ও ভ্রমণ সতর্কতা',
        description: 'ভ্রমণস্থলের আবহাওয়া এবং প্যাকিং পরামর্শ।'
      },
      parent: {
        name: 'পরিবার',
        cardTitle: 'স্কুলের সময় ও শিশু সুরক্ষা',
        tagline: 'স্কুল যাতায়াত ও বৃষ্টির সতর্কতা',
        description: 'স্কুল যাতায়াতের আবহাওয়া এবং শিশুদের সতর্কতা।'
      },
      agriculture: {
        name: 'কৃষি',
        cardTitle: 'ফসল আবহাওয়া ও সেচ পরামর্শ',
        tagline: 'মাটির আর্দ্রতা ও ফসল পর্যবেক্ষণ',
        description: 'কৃষি আবহাওয়া এবং সময়মতো সেচ ও কীটনাশক প্রয়োগের পরামর্শ।'
      },
      commuter: {
        name: 'যাতায়াত',
        cardTitle: 'রাস্তার দৃশ্যমানতা ও ট্রাফিক আপডেট',
        tagline: 'কুয়াশা ও রাস্তা জলমগ্ন হওয়ার সতর্কতা',
        description: 'রাস্তার দৃশ্যমানতা এবং নিরাপদ ড্রাইভিং পরামর্শ।'
      },
      events: {
        name: 'অনুষ্ঠান',
        cardTitle: 'খোলামেলা অনুষ্ঠান আবহাওয়া',
        tagline: '১৪ দিনের অনুষ্ঠান উপযোগী আবহাওয়া',
        description: 'অনুষ্ঠান ও বিয়ের জন্য আবহাওয়ার উপযুক্ততা স্কোর।'
      }
    }
  }
};
