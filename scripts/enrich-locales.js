import fs from 'fs';
import path from 'path';

// Translation dictionaries for How-To steps & features across all tools
const toolMetadataAdditions = {
  'image-compressor': {
    de: { features: ["Bis zu 90% Dateigrößenreduktion", "JPEG, PNG und WebP Unterstützung", "Verlustfreier & visueller Modus", "100% lokales RAM-Processing"] },
    hi: { features: ["90% तक फोटो साइज कम करें", "JPG, PNG और WebP सपोर्ट", "सरकारी फॉर्म और जॉब पोर्टल रेडी", "100% प्राइवेट व ऑफलाइन"] },
    es: { features: ["Reducción de hasta un 90% del tamaño", "Soporte para JPEG, PNG y WebP", "Ajuste de calidad visual sin pérdida", "100% local en memoria"] },
    pt: { features: ["Redução de até 90% no tamanho", "Compatível com JPG, PNG e WebP", "Modo visual sem perdas perceptíveis", "Processamento 100% no navegador"] },
    fr: { features: ["Réduction de taille jusqu'à 90%", "Support JPG, PNG et WebP", "Conservation de la qualité visuelle", "100% local dans le navigateur"] }
  },
  'background-remover': {
    de: { features: ["Lokales KI-Neuronales-Netz", "Präzise Freistellung von Personen & Objekten", "Transparentes PNG in Originalauflösung", "Keine Cloud-Uploads"] },
    hi: { features: ["लोकल AI न्यूरल नेटवर्क कटआउट", "ऑटोमैटिक ट्रांसपेरेंट PNG", "फुल एचडी क्वालिटी डाउनलोड", "बिना किसी सर्वर अपलोड के"] },
    es: { features: ["Red neuronal de IA local", "Recorte preciso de personas y objetos", "PNG transparente en alta resolución", "Cero subidas a la nube"] },
    pt: { features: ["Rede neural de IA executada localmente", "Recorte automático e preciso", "PNG transparente em resolução máxima", "Sem envio para a nuvem"] },
    fr: { features: ["Réseau de neurones IA local", "Détourage automatique précis", "Export PNG transparent haute définition", "Zéro upload cloud"] }
  },
  'batch-converter': {
    de: { features: ["Stapelkonvertierung von dutzenden Bildern", "Konvertierung in WebP, PNG, JPG & PDF", "Mehrere Fotos zu 1 PDF zusammenfügen", "1-Klick ZIP-Download"] },
    hi: { features: ["एक साथ कई फोटो कन्वर्ट करें", "JPG, PNG, WebP और PDF सपोर्ट", "मल्टीपल फोटो को 1 PDF बनाएं", "ZIP पैकेज डाउनलोड"] },
    es: { features: ["Conversión masiva por lotes", "Formatos JPG, PNG, WebP y PDF", "Unir múltiples fotos en un solo PDF", "Descarga en archivo ZIP"] },
    pt: { features: ["Conversão em lote ultra rápida", "Formatos WebP, PNG, JPG e PDF", "Juntar várias fotos em um único PDF", "Download do pacote em ZIP"] },
    fr: { features: ["Conversion groupée en masse", "Support des formats JPG, PNG, WebP et PDF", "Fusion de plusieurs photos en un PDF", "Téléchargement groupé en ZIP"] }
  },
  'sign-pdf': {
    de: { features: ["PDFs lokal unterschreiben & ausfüllen", "Unterschrift zeichnen, tippen oder hochladen", "Mehrseitige PDF-Unterstützung", "100% vertraulich für Verträge"] },
    hi: { features: ["PDF डॉक्यूमेंट्स पर डिजिटल सिग्नेचर", "सिग्नेचर ड्रा करें, टाइप करें या अपलोड करें", "मल्टी-पेज PDF सपोर्ट", "कानूनी व प्राइवेट कॉन्ट्रैक्ट्स के लिए सुरक्षित"] },
    es: { features: ["Firmar y rellenar PDF localmente", "Dibujar, teclear o subir firma", "Soporte para documentos de varias páginas", "100% seguro para contratos"] },
    pt: { features: ["Assinatura digital direta no navegador", "Desenhar, digitar ou enviar assinatura", "Suporte a PDFs com múltiplas páginas", "Totalmente confidencial para contratos"] },
    fr: { features: ["Signature de PDF 100% hors ligne", "Dessiner, saisir ou importer une signature", "Support des documents multipages", "Sécurité maximale pour documents légaux"] }
  },
  'png-to-jpg': {
    de: { features: ["Verlustarme Konvertierung von PNG in JPG", "Wählbare Kompressionsqualität", "Stapelverarbeitung & ZIP-Export", "Keine Dateigrößenbeschränkung"] },
    hi: { features: ["PNG से JPG फास्ट कन्वर्जन", "क्वालिटी स्लाइडर कंट्रोल", "बैच कन्वर्जन व ZIP डाउनलोड", "अनलिमिटेड फ्री यूसेज"] },
    es: { features: ["Conversión rápida de PNG a JPG", "Control de calidad y compresión", "Procesamiento por lotes y ZIP", "Sin límites de tamaño"] },
    pt: { features: ["Conversão rápida de PNG para JPG", "Ajuste de compressão personalizado", "Processamento em lote e download ZIP", "Sem limites de arquivos"] },
    fr: { features: ["Conversion rapide de PNG vers JPG", "Réglage fin de la compression", "Traitement par lots et archive ZIP", "Sans limite de fichiers"] }
  },
  'jpg-to-png': {
    de: { features: ["Verlustfreie Konvertierung von JPG in PNG", "Transparenzkanal-Vorbereitung", "Stapelkonvertierung im Arbeitsspeicher", "Volle Auflösung"] },
    hi: { features: ["JPG से PNG लॉसलेस कन्वर्जन", "फुल रेजोल्यूशन आउटपुट", "बैच कन्वर्जन सपोर्ट", "100% लोकल इन-ब्राउज़र"] },
    es: { features: ["Conversión sin pérdidas de JPG a PNG", "Preservación de resolución original", "Conversión masiva por lotes", "100% local en navegador"] },
    pt: { features: ["Conversão sem perda de JPG para PNG", "Preservação da qualidade original", "Processamento de várias imagens simultâneas", "100% no navegador"] },
    fr: { features: ["Conversion sans perte de JPG vers PNG", "Pleine résolution conservée", "Traitement simultané par lots", "Exécution locale sécurisée"] }
  },
  'crop-image': {
    de: {
      howTo: [
        { name: "Bild Öffnen", text: "Wählen Sie ein Foto aus oder ziehen Sie es per Drag & Drop in den Editor." },
        { name: "Zuschnitt Auswählen", text: "Wählen Sie Seitenverhältnisse wie 1:1, 16:9, 4:5 oder Passfoto und passen Sie den Rahmen an." },
        { name: "Zugeschnittenes Bild Speichern", text: "Laden Sie das zugeschnittene Bild in voller Qualität ohne Qualitätsverlust herunter." }
      ],
      features: ["Seitenverhältnis-Vorlagen für Social Media", "Passfoto-Standard (2x2 Zoll)", "Drittel-Regel-Raster für beste Bildkomposition", "100% private lokale Verarbeitung"]
    },
    hi: {
      howTo: [
        { name: "फोटो अपलोड करें", text: "अपनी फोटो सेलेक्ट करें या ड्रैग करके एडिटर में लाएं।" },
        { name: "क्रॉप एरिया चुनें", text: "इंस्टाग्राम 1:1, 4:5, यूट्यूब 16:9 या पासपोर्ट साइज फ्रेम सेट करें।" },
        { name: "क्रॉप फोटो डाउनलोड करें", text: "बिना किसी सर्वर अपलोड के फुल क्वालिटी में सेव करें।" }
      ],
      features: ["सोशल मीडिया और पासपोर्ट फोटो साइज प्रीसेट", "रूल ऑफ थर्ड्स ग्रिड गाइड", "फुल रेजोल्यूशन एक्सपोर्ट", "100% लोकल इन-ब्राउज़र प्रोसेसिंग"]
    },
    es: {
      howTo: [
        { name: "Seleccionar Imagen", text: "Sube tu foto o arrástrala al editor." },
        { name: "Ajustar Cuadrícula", text: "Elige una proporción (1:1, 16:9, 4:5, foto de pasaporte) y mueve el marco." },
        { name: "Descargar Imagen Recortada", text: "Guarda la imagen recortada en resolución original sin pérdidas." }
      ],
      features: ["Plantillas de proporción para redes sociales", "Modo foto carnet / pasaporte", "Cuadrícula de regla de tercios", "100% privado en el navegador"]
    },
    pt: {
      howTo: [
        { name: "Selecionar Imagem", text: "Carregue a foto ou arraste-a para a área de edição." },
        { name: "Ajustar Corte", text: "Escolha proporções como 1:1, 16:9, 4:5 ou formato passaporte e enquadre a foto." },
        { name: "Baixar Imagem Cortada", text: "Salve a foto cortada com qualidade total instantaneamente." }
      ],
      features: ["Proporções predefinidas para redes sociais", "Tamanho padrão para documentos e passaporte", "Grade de composição profissional", "100% local e seguro"]
    },
    fr: {
      howTo: [
        { name: "Choisir une Photo", text: "Importez votre photo ou glissez-la dans l'éditeur." },
        { name: "Ajuster le Cadrage", text: "Sélectionnez un format (1:1, 16:9, 4:5, photo d'identité) et déplacez la zone." },
        { name: "Télécharger la Photo", text: "Enregistrez votre photo recadrée en haute définition sans compression inutile." }
      ],
      features: ["Formats prédéfinis pour réseaux sociaux", "Gabarit pour photos d'identité", "Grille de composition règle des tiers", "Traitement 100% local et sécurisé"]
    }
  },
  'rotate-image': {
    de: {
      howTo: [
        { name: "Bild Laden", text: "Öffnen Sie Ihr Foto im Dreh-Werkzeug." },
        { name: "Drehwinkel Wählen", text: "Drehen Sie um 90°, 180° oder spiegeln Sie horizontal und vertikal." },
        { name: "Gedrehtes Bild Speichern", text: "Laden Sie das ausgerichtete Bild herunter." }
      ],
      features: ["90°, 180° und 270° Drehung", "Horizontales & vertikales Spiegeln", "Horizont-Begradigung", "Keine Qualitätsverluste"]
    },
    hi: {
      howTo: [
        { name: "फोटो चुनें", text: "जिस फोटो को घुमाना या सीधा करना है उसे सेलेक्ट करें।" },
        { name: "रोटेशन व फ्लिप सेट करें", text: "90°, 180° रोटेट करें या हॉरिजॉन्टल/वर्टिकल मिरर करें।" },
        { name: "सेव करें", text: "सीधी की गई फोटो तुरंत डाउनलोड करें।" }
      ],
      features: ["90° और 180° रोटेशन", "हॉरिजॉन्टल और वर्टिकल फ्लिप", "बिना क्वालिटी कम किए फास्ट एक्सपोर्ट", "100% सुरक्षित"]
    },
    es: {
      howTo: [
        { name: "Cargar Foto", text: "Selecciona la foto que deseas girar o enderezar." },
        { name: "Ajustar Giro y Reflejo", text: "Gira 90°, 180° o voltea horizontal y verticalmente." },
        { name: "Descargar Foto", text: "Guarda la imagen rotada sin pérdida de calidad." }
      ],
      features: ["Rotación precisa de 90° y 180°", "Efecto espejo horizontal y vertical", "Enderezado de horizonte", "Procesamiento sin servidor"]
    },
    pt: {
      howTo: [
        { name: "Carregar Foto", text: "Selecione a imagem que deseja girar." },
        { name: "Girar ou Espelhar", text: "Aplique rotação de 90°, 180° ou espelhamento horizontal e vertical." },
        { name: "Baixar Resultado", text: "Salve a imagem corrigida em alta qualidade." }
      ],
      features: ["Giro rápido de 90° e 180°", "Espelhamento horizontal e vertical", "Alinhamento de horizonte", "Sem envio para a nuvem"]
    },
    fr: {
      howTo: [
        { name: "Ouvrir l'Image", text: "Sélectionnez votre photo à pivoter." },
        { name: "Pivoter ou Retourner", text: "Faites pivoter de 90°, 180° ou retournez horizontalement et verticalement." },
        { name: "Enregistrer l'Image", text: "Téléchargez la photo redressée en qualité maximale." }
      ],
      features: ["Rotation instantanée 90° et 180°", "Miroir horizontal et vertical", "Redressement d'horizon", "Traitement hors ligne"]
    }
  },
  'add-border-to-image': {
    de: {
      howTo: [
        { name: "Foto Öffnen", text: "Wählen Sie das Bild aus, dem Sie einen Rahmen hinzufügen möchten." },
        { name: "Rahmenstil Konfigurieren", text: "Wählen Sie Rahmenbreite, Farbpalette, Unschärfe-Hintergrund oder abgerundete Ecken." },
        { name: "Gerahmtes Bild Herunterladen", text: "Speichern Sie das fertige Bild für Instagram oder Druck." }
      ],
      features: ["Volltonfarben & Unschärfe-Hintergrund", "Abgerundete Ecken mit Schatten", "Perfekt für Instagram & Social Media", "100% privat"]
    },
    hi: {
      howTo: [
        { name: "फोटो चुनें", text: "जिस फोटो में बॉर्डर लगाना है उसे अपलोड करें।" },
        { name: "बॉर्डर स्टाइल कस्टमाइज करें", text: "कलर, बॉर्डर चौड़ाई, ब्लर बैकग्राउंड या राउंडेड कॉर्नर सेट करें।" },
        { name: "डाउनलोड करें", text: "सोशल मीडिया रेडी फ्रेम वाली फोटो सेव करें।" }
      ],
      features: ["कलर और ब्लर बैकग्राउंड बॉर्डर", "राउंडेड कॉर्नर और शैडो इफेक्ट्स", "इंस्टाग्राम नो-क्रॉप बॉर्डर", "फास्ट और फ्री"]
    },
    es: {
      howTo: [
        { name: "Seleccionar Foto", text: "Sube la imagen a la que deseas añadir borde." },
        { name: "Personalizar Borde", text: "Ajusta el grosor, color, fondo desenfocado o esquinas redondeadas." },
        { name: "Guardar Imagen", text: "Descarga la foto con marco lista para redes sociales." }
      ],
      features: ["Bordes con color o fondo desenfocado", "Bordes redondeados y sombras elegantes", "Optimizado para Instagram", "Sin registros"]
    },
    pt: {
      howTo: [
        { name: "Carregar Foto", text: "Escolha a foto que receberá a moldura." },
        { name: "Definir Borda", text: "Ajuste espessura, cor sólida, fundo desfocado e cantos arredondados." },
        { name: "Baixar Foto", text: "Salve a imagem emoldurada em alta resolução." }
      ],
      features: ["Cores personalizadas e desfoque de fundo", "Cantos arredondados modernos", "Ideal para feed do Instagram", "Processamento no navegador"]
    },
    fr: {
      howTo: [
        { name: "Importer une Image", text: "Sélectionnez l'image à encadrer." },
        { name: "Personnaliser le Cadre", text: "Définissez la largeur, la couleur, l'arrière-plan flou ou les coins arrondis." },
        { name: "Télécharger le Rendu", text: "Enregistrez votre photo encadrée en pleine résolution." }
      ],
      features: ["Arrière-plan flou ou couleurs unies", "Coins arrondis et ombres portées", "Prêt pour Instagram sans recadrage", "Confidentialité totale"]
    }
  },
  'photo-filters': {
    de: {
      howTo: [
        { name: "Bild Importieren", text: "Laden Sie Ihr Foto in das Filter-Studio." },
        { name: "Filterstil Auswählen", text: "Wählen Sie aus Vintage, Duotone, Cyberpunk, Schwarz-Weiß oder Film-Looks." },
        { name: "Gefiltertes Foto Speichern", text: "Laden Sie das künstlerisch veredelte Foto herunter." }
      ],
      features: ["Vintage-, Duotone- & Cyberpunk-Filter", "Echtzeit-Vorschau im Browser", "Keine Qualitätsreduktion", "100% werbefrei & lokal"]
    },
    hi: {
      howTo: [
        { name: "फोटो अपलोड करें", text: "फोटो को फिल्टर स्टूडियो में लाएं।" },
        { name: "फिल्टर इफेक्ट चुनें", text: "विंटेज, डुओटोन, रेट्रो या ब्लैक एंड व्हाइट फिल्टर अप्लाई करें।" },
        { name: "डाउनलोड करें", text: "नया लुक तुरंत सेव करें।" }
      ],
      features: ["विंटेज, डुओटोन और सिनेमैटिक फिल्टर्स", "लाइव प्रीव्यू", "फुल एचडी क्वालिटी", "100% फ्री"]
    },
    es: {
      howTo: [
        { name: "Subir Foto", text: "Añade la foto que quieres transformar." },
        { name: "Aplicar Filtro", text: "Elige entre filtros vintage, duotono, cyberpunk o blanco y negro." },
        { name: "Guardar Foto", text: "Descarga la imagen con el filtro aplicado." }
      ],
      features: ["Filtros retro, vintage y duotono", "Previsualización instantánea", "Máxima calidad de salida", "Privacidad garantizada"]
    },
    pt: {
      howTo: [
        { name: "Importar Foto", text: "Carregue a imagem para aplicar os efeitos." },
        { name: "Escolher Filtro", text: "Experimente filtros vintage, duotone, retrô ou preto e branco." },
        { name: "Salvar Imagem", text: "Baixe a foto tratada com visual profissional." }
      ],
      features: ["Filtros vintage, duotone e cinematográficos", "Pré-visualização em tempo real", "Sem redução de resolução", "Segurança e privacidade"]
    },
    fr: {
      howTo: [
        { name: "Sélectionner une Photo", text: "Importez la photo à styliser." },
        { name: "Appliquer un Filtre", text: "Choisissez un effet vintage, duotone, cyberpunk ou noir et blanc." },
        { name: "Télécharger l'Image", text: "Enregistrez votre photo stylisée en un clic." }
      ],
      features: ["Filtres vintage, duotone et artistiques", "Aperçu instantané sans latence", "Pleine résolution conservée", "100% local dans le navigateur"]
    }
  },
  'invert-colors': {
    de: {
      howTo: [
        { name: "Bild Auswählen", text: "Laden Sie das Foto in den Inverter." },
        { name: "Effekt Wählen", text: "Invertieren Sie RGB-Farben, erzeugen Sie Negativfilme oder binarisiertes Schwarz-Weiß." },
        { name: "Ergebnis Herunterladen", text: "Speichern Sie das invertierte Bild." }
      ],
      features: ["RGB Farbumkehrung", "Fotonegativ-Modus", "Otsu Schwarz-Weiß Binarisierung", "Kein Serverzugriff"]
    },
    hi: {
      howTo: [
        { name: "फोटो सेलेक्ट करें", text: "फोटो अपलोड करें।" },
        { name: "कलर इन्वर्ट करें", text: "RGB कलर नेगेटिव या हाई-कंट्रास्ट ब्लैक एंड व्हाइट इफेक्ट चुनें।" },
        { name: "डाउनलोड करें", text: "कलर इन्वर्टेड फोटो तुरंत सेव करें।" }
      ],
      features: ["RGB कलर इनवर्शन", "फोटो नेगेटिव इफ़ेक्ट", "हाई-कंट्रास्ट ब्लैक एंड व्हाइट", "100% ऑफलाइन"]
    },
    es: {
      howTo: [
        { name: "Cargar Imagen", text: "Sube la imagen a procesar." },
        { name: "Invertir Colores", text: "Aplica negativo de color o blanco y negro de alto contraste." },
        { name: "Descargar Imagen", text: "Guarda la imagen invertida." }
      ],
      features: ["Inversión RGB completa", "Efecto negativo fotográfico", "Umbralización blanco y negro", "Procesamiento instantáneo"]
    },
    pt: {
      howTo: [
        { name: "Carregar Imagem", text: "Selecione o arquivo desejado." },
        { name: "Inverter Cores", text: "Transforme a foto em negativo ou preto e branco de alto contraste." },
        { name: "Baixar Resultado", text: "Salve a imagem com cores invertidas." }
      ],
      features: ["Inversão de cores RGB", "Efeito negativo analógico", "Binarização preto e branco", "Zero upload"]
    },
    fr: {
      howTo: [
        { name: "Importer l'Image", text: "Sélectionnez la photo à inverser." },
        { name: "Appliquer l'Inversion", text: "Générez un négatif photo ou un noir et blanc à fort contraste." },
        { name: "Télécharger le Rendu", text: "Enregistrez votre image inversée." }
      ],
      features: ["Inversion des couleurs RVB", "Mode négatif argentique", "Binarisation noir et blanc nette", "Exécution locale"]
    }
  },
  'adjust-image': {
    de: {
      howTo: [
        { name: "Foto Hochladen", text: "Öffnen Sie Ihr Bild im Belichtungs- und Farb-Editor." },
        { name: "Regler Einstellen", text: "Optimieren Sie Helligkeit, Kontrast, Sättigung, Wärme und Schärfe mit Vorher/Nachher-Ansicht." },
        { name: "Optimiertes Bild Speichern", text: "Laden Sie das perfekt abgestimmte Foto herunter." }
      ],
      features: ["Helligkeit, Kontrast & Sättigung", "1-Klick Auto-Verbesserung", "Schärfe- und Wärme-Regler", "Echtzeit Vorher/Nachher Split-Ansicht"]
    },
    hi: {
      howTo: [
        { name: "फोटो सेलेक्ट करें", text: "एडिटर में फोटो लाएं।" },
        { name: "ब्राइटनेस और कंट्रास्ट सेट करें", text: "ब्राइटनेस, कंट्रास्ट, सैचुरेशन और शार्पनेस स्लाइडर से एडजस्ट करें।" },
        { name: "डाउनलोड करें", text: "सुधारी गई फोटो तुरंत सेव करें।" }
      ],
      features: ["ब्राइटनेस, कंट्रास्ट और सैचुरेशन कंट्रोल", "1-क्लिक ऑटो एन्हांस", "शार्पनेस और वार्मथ एडजस्टमेंट", "लाइव तुलना मोड"]
    },
    es: {
      howTo: [
        { name: "Subir Foto", text: "Abre la foto que deseas mejorar." },
        { name: "Ajustar Parámetros", text: "Modifica brillo, contraste, saturación, calidez y nitidez con vista comparativa." },
        { name: "Guardar Foto", text: "Descarga la foto optimizada en alta calidad." }
      ],
      features: ["Control de brillo, contraste y color", "Mejora automática con 1 clic", "Ajuste de nitidez y calidez", "Comparador antes/después en vivo"]
    },
    pt: {
      howTo: [
        { name: "Carregar Foto", text: "Abra a imagem no editor de ajuste." },
        { name: "Ajustar Sliders", text: "Regule brilho, contraste, saturação e nitidez com visualização lado a lado." },
        { name: "Baixar Foto", text: "Salve o arquivo otimizado com fidelidade máxima." }
      ],
      features: ["Ajuste de brilho, contraste e saturação", "Auto-melhoria em 1 clique", "Nitidez e temperatura de cor", "Comparação antes e depois"]
    },
    fr: {
      howTo: [
        { name: "Importer une Photo", text: "Ouvrez votre image dans l'éditeur de retouche." },
        { name: "Régler les Paramètres", text: "Ajustez la luminosité, le contraste, la saturation et la netteté avec vue avant/après." },
        { name: "Télécharger l'Image", text: "Enregistrez la photo retouchée." }
      ],
      features: ["Contrôle de luminosité et contraste", "Amélioration automatique 1-clic", "Réglage de netteté et balance des blancs", "Vue comparative en temps réel"]
    }
  },
  'meme-generator': {
    de: {
      howTo: [
        { name: "Meme-Vorlage Laden", text: "Wählen Sie ein eigenes Foto oder eine Vorlage." },
        { name: "Texte & Effekte Hinzufügen", text: "Schreiben Sie Text für oben und unten mit klassischer Impact-Schrift und Kontur." },
        { name: "Meme Herunterladen", text: "Speichern Sie das fertige Meme ohne Wasserzeichen." }
      ],
      features: ["Klassische Impact-Meme-Schrift mit Kontur", "Eigene Bilder oder Vorlagen", "Keine fremden Wasserzeichen", "Schneller 1-Klick-Export"]
    },
    hi: {
      howTo: [
        { name: "फोटो चुनें", text: "मीम बनाने के लिए फोटो या टेम्पलेट सेलेक्ट करें।" },
        { name: "टेक्स्ट जोड़ें", text: "ऊपर और नीचे इम्पैक्ट फॉन्ट में मजेदार कैप्शन लिखें।" },
        { name: "मीम डाउनलोड करें", text: "बिना किसी वॉटरमार्क के मीम सेव करें।" }
      ],
      features: ["क्लासिक इम्पैक्ट फॉन्ट और आउटलाइन", "कस्टम फोटो अपलोड सपोर्ट", "ज़ीरो वॉटरमार्क", "तुरंत शेयर करने योग्य"]
    },
    es: {
      howTo: [
        { name: "Subir Imagen", text: "Elige tu propia foto o plantilla de meme." },
        { name: "Añadir Texto", text: "Escribe texto superior e inferior con tipografía clásica Impact y contorno." },
        { name: "Descargar Meme", text: "Guarda tu meme al instante sin marcas de agua." }
      ],
      features: ["Tipografía Impact con bordes", "Posicionamiento libre de textos", "Sin marcas de agua molestas", "Exportación rápida"]
    },
    pt: {
      howTo: [
        { name: "Escolher Imagem", text: "Carregue sua foto ou template favorito." },
        { name: "Adicionar Legendas", text: "Escreva o texto superior e inferior com estilo clássico e contorno preto." },
        { name: "Baixar Meme", text: "Salve seu meme pronto sem marcas d'água." }
      ],
      features: ["Fonte Impact com contorno clássico", "Total liberdade de edição", "Sem marcas d'água externas", "Download instantâneo"]
    },
    fr: {
      howTo: [
        { name: "Sélectionner une Image", text: "Importez votre photo ou votre modèle de mème." },
        { name: "Ajouter du Texte", text: "Rédigez les légendes haute et basse avec la police Impact et contour." },
        { name: "Télécharger le Mème", text: "Enregistrez votre mème sans filigrane." }
      ],
      features: ["Police Impact avec contour net", "Positionnement personnalisé", "Aucun filigrane publicitaire", "Export ultra rapide"]
    }
  },
  'watermark-overlay': {
    de: {
      howTo: [
        { name: "Bilder Hochladen", text: "Wählen Sie einzelne oder mehrere Fotos im Stapel aus." },
        { name: "Wasserzeichen Gestalten", text: "Fügen Sie Text oder ein Logo-Bild mit Deckkraft, Rotation und Position hinzu." },
        { name: "Geschützte Bilder Herunterladen", text: "Laden Sie die geschützten Fotos einzeln oder als ZIP herunter." }
      ],
      features: ["Text- und Bild-Logo-Wasserzeichen", "Stapelverarbeitung für hunderte Fotos", "Deckkraft-, Rotations- und Kachel-Modus", "1-Klick ZIP-Download"]
    },
    hi: {
      howTo: [
        { name: "फोटो चुनें", text: "एक या कई फोटो एक साथ सेलेक्ट करें।" },
        { name: "वॉटरमार्क सेट करें", text: "टेक्स्ट या लोगो इमेज जोड़ें और ओपेसिटी/पोजीशन सेट करें।" },
        { name: "डाउनलोड करें", text: "सभी फोटो को एक साथ या ZIP में सेव करें।" }
      ],
      features: ["टेक्स्ट और लोगो वॉटरमार्क सपोर्ट", "एक साथ मल्टीपल फोटो पर वॉटरमार्क", "ओपेसिटी और टाइल इफेक्ट", "ZIP पैकेज एक्सपोर्ट"]
    },
    es: {
      howTo: [
        { name: "Cargar Imágenes", text: "Sube una o varias fotos por lotes." },
        { name: "Configurar Marca de Agua", text: "Añade texto o logotipo con control de opacidad, tamaño y rotación." },
        { name: "Descargar Lote", text: "Guarda las fotos protegidas en un archivo ZIP o individualmente." }
      ],
      features: ["Marcas de agua de texto y logotipo", "Procesamiento por lotes ilimitado", "Control de opacidad y posición", "Descarga en ZIP con 1 clic"]
    },
    pt: {
      howTo: [
        { name: "Carregar Fotos", text: "Selecione uma ou várias imagens em lote." },
        { name: "Criar Marca d'Água", text: "Insira texto ou logotipo e ajuste opacidade, escala e ângulo." },
        { name: "Baixar Arquivos", text: "Salve todas as fotos protegidas em um arquivo ZIP." }
      ],
      features: ["Marca d'água de texto ou imagem de logotipo", "Aplicação em lote instantânea", "Opacidade e rotação personalizadas", "Download ZIP com 1 clique"]
    },
    fr: {
      howTo: [
        { name: "Importer les Photos", text: "Chargez une ou plusieurs photos par lots." },
        { name: "Créer le Filigrane", text: "Ajoutez un texte ou un logo avec réglage d'opacité, d'angle et d'échelle." },
        { name: "Télécharger les Images", text: "Téléchargez toutes vos photos protégées individuellement ou en ZIP." }
      ],
      features: ["Filigranes texte ou logo image", "Traitement par lots sans limite", "Réglage précis d'opacité et de mosaïque", "Exportation ZIP rapide"]
    }
  },
  'metadata-stripper': {
    de: {
      howTo: [
        { name: "Fotos Auswählen", text: "Laden Sie Ihre Bilder in den Metadaten-Bereiniger." },
        { name: "EXIF- & GPS-Daten Prüfen", text: "Sehen Sie Kameraeinstellungen, Aufnahmeort und Aufnahmedatum ein." },
        { name: "Bereinigte Fotos Herunterladen", text: "Entfernen Sie alle sensiblen Metadaten mit 1 Klick für sicheres Teilen." }
      ],
      features: ["GPS-Standort & Kameramodell entfernen", "EXIF-, IPTC- und XMP-Datenlöschung", "Stapelbereinigung für mehrere Fotos", "100% offline & privatsphärefreundlich"]
    },
    hi: {
      howTo: [
        { name: "फोटो चुनें", text: "फोटो अपलोड करें जिनकी EXIF डिटेल्स देखनी या हटानी हैं।" },
        { name: "GPS और कैमरा डेटा देखें", text: "लोकेशन, कैमरा मॉडल और समय की जानकारी चेक करें।" },
        { name: "क्लीन फोटो डाउनलोड करें", text: "1-क्लिक में सभी प्राइवेट मेटाडेटा हटाकर फोटो सुरक्षित करें।" }
      ],
      features: ["GPS लोकेशन व कैमरा डेटा रिमूवल", "EXIF व IPTC मेटाडेटा क्लीनर", "मल्टीपल फोटो बैच सपोर्ट", "सोशल मीडिया शेयरिंग के लिए सेफ"]
    },
    es: {
      howTo: [
        { name: "Seleccionar Fotos", text: "Sube las imágenes que deseas inspeccionar o limpiar." },
        { name: "Revisar Datos EXIF", text: "Visualiza coordenadas GPS, modelo de cámara y fecha." },
        { name: "Descargar Fotos Limpias", text: "Elimina todos los metadatos ocultos para compartir de forma segura." }
      ],
      features: ["Eliminación de GPS y modelo de cámara", "Limpieza total de datos EXIF e IPTC", "Procesamiento por lotes", "Protección de privacidad 100% local"]
    },
    pt: {
      howTo: [
        { name: "Carregar Fotos", text: "Envie as fotos que deseja auditar e limpar." },
        { name: "Inspecionar Dados EXIF", text: "Veja localização GPS, câmera, lente e data do disparo." },
        { name: "Baixar Fotos Seguras", text: "Remova todas as informações confidenciais em 1 clique." }
      ],
      features: ["Remoção de GPS e dados da câmera", "Exclusão de metadados EXIF e IPTC", "Suporte a múltiplos arquivos", "Totalmente seguro e offline"]
    },
    fr: {
      howTo: [
        { name: "Sélectionner les Photos", text: "Importez les images contenant des données EXIF." },
        { name: "Vérifier les Métadonnées", text: "Consultez la localisation GPS, le modèle d'appareil et la date." },
        { name: "Télécharger les Fichiers Sains", text: "Supprimez toutes les données sensibles avant publication." }
      ],
      features: ["Suppression des coordonnées GPS et modèle d'appareil", "Nettoyage complet EXIF et IPTC", "Traitement groupé de photos", "Confidentialité absolue"]
    }
  },
  'pixel-art-generator': {
    de: {
      howTo: [
        { name: "Bild Hochladen", text: "Wählen Sie ein beliebiges Porträt oder Landschaftsfoto." },
        { name: "Pixelgröße & Palette Einstellen", text: "Wählen Sie Pixelblockgröße und Retro-Paletten wie Game Boy, NES oder PICO-8." },
        { name: "Pixel Art Speichern", text: "Laden Sie das 8-Bit Retro-Kunstwerk herunter." }
      ],
      features: ["Klassische 8-Bit Retro-Farbpaletten (Game Boy, NES)", "Floyd-Steinberg Dithering-Algorithmus", "Einstellbare Pixelgröße", "Verlustfreier PNG-Export"]
    },
    hi: {
      howTo: [
        { name: "फोटो चुनें", text: "फोटो अपलोड करें जिसे 8-बिट पिक्सेल आर्ट में बदलना है।" },
        { name: "पिक्सेल साइज व पैलेट चुनें", text: "गेमबॉय, NES या रेट्रो कलर पैलेट और पिक्सेल साइज सेट करें।" },
        { name: "पिक्सेल आर्ट डाउनलोड करें", text: "8-बिट विंटेज फोटो तुरंत सेव करें।" }
      ],
      features: ["गेमबॉय व रेट्रो 8-बिट पैलेट्स", "फ्लॉइड-स्टाइनबर्ग डिथरिंग", "कस्टमाइजेबल पिक्सेल ब्लॉक साइज", "फुल एचडी PNG एक्सपोर्ट"]
    },
    es: {
      howTo: [
        { name: "Subir Foto", text: "Añade la foto que deseas pixelar." },
        { name: "Elegir Paleta y Bloque", text: "Selecciona paletas retro (Game Boy, NES, PICO-8) y tamaño de píxel." },
        { name: "Descargar Pixel Art", text: "Guarda tu obra retro en formato PNG de alta nitidez." }
      ],
      features: ["Paletas de color retro (Game Boy, NES)", "Algoritmo de difusión Floyd-Steinberg", "Tamaño de cuadrícula ajustable", "Exportación PNG sin borrosidad"]
    },
    pt: {
      howTo: [
        { name: "Carregar Imagem", text: "Envie a foto que deseja converter em arte retrô." },
        { name: "Configurar Resolução 8-Bit", text: "Escolha paletas retrô como Game Boy ou NES e tamanho do pixel." },
        { name: "Baixar Pixel Art", text: "Salve a imagem estilizada em PNG nítido." }
      ],
      features: ["Paletas clássicas estilo Game Boy e NES", "Pontilhado Floyd-Steinberg avançado", "Controle de tamanho de pixel", "Exportação PNG nítida"]
    },
    fr: {
      howTo: [
        { name: "Importer une Photo", text: "Sélectionnez l'image à convertir en pixel art." },
        { name: "Choisir la Palette Rétro", text: "Sélectionnez une palette Game Boy, NES ou PICO-8 et réglez la taille des pixels." },
        { name: "Télécharger le Pixel Art", text: "Enregistrez votre création 8-bit en PNG net." }
      ],
      features: ["Palettes rétro classiques (Game Boy, NES)", "Trame de diffusion Floyd-Steinberg", "Taille de blocs ajustable", "Export PNG haute définition"]
    }
  },
  'ascii-art-generator': {
    de: {
      howTo: [
        { name: "Foto Öffnen", text: "Wählen Sie ein kontrastreiches Bild aus." },
        { name: "Zeichensatz & Theme Wählen", text: "Passen Sie Zeichendichte, Matrix-Grün, ANSI-Farben oder Monochrom an." },
        { name: "ASCII Art Kopieren / Herunterladen", text: "Kopieren Sie den Text oder laden Sie ihn als hochauflösendes Bild herunter." }
      ],
      features: ["Matrix-Grün, ANSI-Farben & Monochrom-Themen", "Detaillierte Zeichendichte-Steuerung", "Text kopieren oder als PNG exportieren", "100% Client-Side Engine"]
    },
    hi: {
      howTo: [
        { name: "फोटो चुनें", text: "फोटो एडिटर में अपलोड करें।" },
        { name: "ASCII थीम व डेंसिटी चुनें", text: "मैट्रिक्स ग्रीन, कलर या क्लासिक मोनोक्रोम कैरेक्टर सेट करें।" },
        { name: "टेक्स्ट कॉपी करें या इमेज सेव करें", text: "ASCII टेक्स्ट कॉपी करें या हाई-रेजोल्यूशन PNG डाउनलोड करें।" }
      ],
      features: ["मैट्रिक्स ग्रीन और कलर ANSI मोड्स", "एडजस्टेबल कैरेक्टर डेंसिटी", "1-क्लिक टेक्स्ट कॉपी व PNG डाउनलोड", "फास्ट WASM पावर्ड"]
    },
    es: {
      howTo: [
        { name: "Cargar Imagen", text: "Sube la foto que deseas transformar en texto." },
        { name: "Seleccionar Estilo ASCII", text: "Ajusta la densidad de caracteres y temas como Matrix verde o color ANSI." },
        { name: "Copiar o Descargar", text: "Copia el texto plano o descarga la imagen renderizada en PNG." }
      ],
      features: ["Temas Matrix verde, color ANSI y blanco y negro", "Control de densidad y contraste", "Copia al portapapeles y descarga PNG", "Sin límites de uso"]
    },
    pt: {
      howTo: [
        { name: "Carregar Foto", text: "Selecione a imagem que deseja transformar em texto." },
        { name: "Ajustar Efeito ASCII", text: "Escolha tema Matrix, cores ANSI e densidade de caracteres." },
        { name: "Copiar ou Baixar", text: "Copie o texto ASCII ou salve a imagem em PNG." }
      ],
      features: ["Modos Matrix, cores ANSI e monocromático", "Densidade de caracteres ajustável", "Cópia direta e exportação em imagem", "Processamento 100% no navegador"]
    },
    fr: {
      howTo: [
        { name: "Importer une Image", text: "Chargez l'image à convertir en art ASCII." },
        { name: "Choisir le Style ASCII", text: "Sélectionnez le thème Matrix, les couleurs ANSI et la densité des caractères." },
        { name: "Copier ou Exporter", text: "Copiez le texte brut ou téléchargez le rendu en image PNG." }
      ],
      features: ["Thèmes Matrix vert, couleurs ANSI et monochrome", "Réglage précis du contraste et des caractères", "Copie presse-papiers et téléchargement PNG", "Zéro transfert serveur"]
    }
  },
  'glitch-image-generator': {
    de: {
      howTo: [
        { name: "Bild Importieren", text: "Laden Sie das gewünschte Foto in das Glitch-Studio." },
        { name: "Effekte Mixen", text: "Aktivieren Sie RGB-Farbverschiebung, CRT-Scanlines, VHS-Artefakte und Datamoshing." },
        { name: "Glitch Art Speichern", text: "Laden Sie das verzerrte Cyberpunk-Bild herunter." }
      ],
      features: ["RGB Chromatic Aberration", "CRT TV Scanlines & Phosphor-Glow", "VHS Tape Distortion & Noise", "Echtzeit-Canvas-Rendering"]
    },
    hi: {
      howTo: [
        { name: "फोटो अपलोड करें", text: "फोटो को ग्लिच स्टूडियो में लाएं।" },
        { name: "ग्लिच इफेक्ट्स अप्लाई करें", text: "RGB कलर शिफ्ट, VHS डिस्टॉर्शन और CRT टीवी लाइन्स जोड़ें।" },
        { name: "ग्लिच आर्ट डाउनलोड करें", text: "साइबरपंक स्टाइल फोटो तुरंत सेव करें।" }
      ],
      features: ["RGB क्रोमैटिक एबर्रेशन", "CRT टीवी स्कैनलाइन्स", "VHS नॉइज़ व डिस्टॉर्शन", "फुल रेजोल्यूशन एक्सपोर्ट"]
    },
    es: {
      howTo: [
        { name: "Subir Foto", text: "Importa la foto que deseas distorsionar." },
        { name: "Mezclar Efectos Glitch", text: "Combina aberración cromática RGB, líneas CRT y ruido VHS retro." },
        { name: "Descargar Obra Glitch", text: "Guarda tu creación cyberpunk en alta resolución." }
      ],
      features: ["Desplazamiento de canales RGB", "Líneas de escaneo estilo TV CRT", "Distorsión y ruido de cinta VHS", "Renderizado en tiempo real"]
    },
    pt: {
      howTo: [
        { name: "Carregar Imagem", text: "Selecione a foto para aplicar os efeitos glitch." },
        { name: "Personalizar Efeitos", text: "Ative aberração RGB, linhas CRT retrô e ruído de fita VHS." },
        { name: "Baixar Arte Glitch", text: "Salve a imagem com visual cyberpunk em alta resolução." }
      ],
      features: ["Aberração cromática RGB", "Linhas de TV CRT vintage", "Ruído analógico de fita VHS", "Execução instantânea"]
    },
    fr: {
      howTo: [
        { name: "Importer une Image", text: "Sélectionnez l'image à transformer en art glitch." },
        { name: "Composer les Effets", text: "Activez le décalage RGB, les lignes CRT et la distorsion VHS." },
        { name: "Télécharger le Rendu Glitch", text: "Enregistrez votre composition cyberpunk en haute définition." }
      ],
      features: ["Aberration chromatique RVB", "Lignes de balayage écran CRT vintage", "Distorsion et grain de bande VHS", "Rendu graphique en direct"]
    }
  },
  'side-by-side-image': {
    de: {
      howTo: [
        { name: "Zwei Bilder Auswählen", text: "Laden Sie das Vorher- und Nachher-Foto hoch." },
        { name: "Layout & Beschriftung Anpassen", text: "Wählen Sie Nebeneinander- oder Übereinander-Modus und beschriften Sie die Badges." },
        { name: "Vergleichsbild Speichern", text: "Laden Sie die fertige Fotocollage in voller Schärfe herunter." }
      ],
      features: ["Horizontale & vertikale Ausrichtung", "Einstellbare Trennlinien & Rahmen", "Individuelle Vorher/Nachher-Labels", "Keine Kompressionsverluste"]
    },
    hi: {
      howTo: [
        { name: "दो फोटो सेलेक्ट करें", text: "बिफोर और आफ्टर दोनों फोटो अपलोड करें।" },
        { name: "लेआउट सेट करें", text: "साइड-बाय-साइड या ऊपर-नीचे लेआउट और टेक्स्ट लेबल सेट करें।" },
        { name: "कंपैरिजन फोटो डाउनलोड करें", text: "दोनों फोटो को जोड़कर बनी कंबाइंड इमेज सेव करें।" }
      ],
      features: ["साइड-बाय-साइड और वर्टिकल लेआउट", "कस्टमाइजेबल बिफोर/आफ्टर बैज", "बॉर्डर व स्पेसिंग कंट्रोल", "100% फ्री"]
    },
    es: {
      howTo: [
        { name: "Subir Dos Fotos", text: "Carga la imagen de antes y la de después." },
        { name: "Configurar Disposición", text: "Elige alineación horizontal o vertical y personaliza las etiquetas." },
        { name: "Descargar Comparativa", text: "Guarda la imagen combinada en máxima resolución." }
      ],
      features: ["Alineación lado a lado o vertical", "Líneas divisorias y marcos ajustables", "Etiquetas personalizadas Antes/Después", "Descarga instantánea"]
    },
    pt: {
      howTo: [
        { name: "Carregar Duas Imagens", text: "Selecione as fotos de antes e depois." },
        { name: "Ajustar Visualização", text: "Escolha exibição lado a lado ou sobreposta e edite as legendas." },
        { name: "Baixar Comparação", text: "Salve a imagem composta em alta resolução." }
      ],
      features: ["Visualização horizontal ou vertical", "Bordas e divisores ajustáveis", "Badges personalizadas de Antes/Depois", "Sem perda de resolução"]
    },
    fr: {
      howTo: [
        { name: "Importer Deux Photos", text: "Chargez l'image avant et l'image après." },
        { name: "Choisir la Disposition", text: "Basculez entre vue côte à côte ou empilée et personnalisez les badges." },
        { name: "Télécharger le Montage", text: "Enregistrez le comparatif en pleine qualité." }
      ],
      features: ["Disposition côte à côte ou verticale", "Bordures et séparateurs ajustables", "Badges Avant/Après personnalisables", "Traitement local sécurisé"]
    }
  },
  'instagram-panorama-splitter': {
    de: {
      howTo: [
        { name: "Panoramabild Laden", text: "Wählen Sie Ihr Weitwinkel- oder Panoramabild aus." },
        { name: "Kachelanzahl & Format Wählen", text: "Wählen Sie 2 bis 10 Kacheln im Instagram 4:5 Porträt- oder 1:1 Quadratformat." },
        { name: "Karussell-ZIP Herunterladen", text: "Laden Sie alle nahtlosen Teilbilder fertig nummeriert im ZIP-Archiv herunter." }
      ],
      features: ["Nahtlose Wisch-Karussells für Instagram & TikTok", "Optimiert für 4:5 Porträt- & 1:1 Quadratformate", "Automatische Nummerierung (1, 2, 3...)", "1-Klick ZIP-Download"]
    },
    hi: {
      howTo: [
        { name: "पैनोरमा फोटो चुनें", text: "अपनी वाइड या पैनोरमा फोटो अपलोड करें।" },
        { name: "स्प्लिट संख्या सेट करें", text: "2 से 10 टाइल्स और 4:5 पोर्ट्रेट या 1:1 स्क्वायर फॉर्मेट चुनें।" },
        { name: "ZIP फाइल डाउनलोड करें", text: "स्वाइप कैरोसेल के लिए नंबरिंग के साथ सभी टुकड़े ZIP में सेव करें।" }
      ],
      features: ["इंस्टाग्राम सीमलेस स्वाइप कैरोसेल", "4:5 पोर्ट्रेट व 1:1 स्क्वायर सपोर्ट", "ऑटोमैटिक फोटो नंबरिंग", "1-क्लिक ZIP पैकेज डाउनलोड"]
    },
    es: {
      howTo: [
        { name: "Subir Foto Panorámica", text: "Selecciona tu foto ancha o panorámica." },
        { name: "Elegir Cortes y Formato", text: "Selecciona entre 2 y 10 piezas en formato 4:5 vertical o 1:1 cuadrado." },
        { name: "Descargar ZIP de Carrusel", text: "Guarda las imágenes numeradas en un archivo ZIP listas para publicar." }
      ],
      features: ["Carruseles continuos sin cortes visibles", "Formatos 4:5 retrato y 1:1 cuadrado para Instagram", "Numeración automática de diapositivas", "Descarga en ZIP con 1 clic"]
    },
    pt: {
      howTo: [
        { name: "Carregar Panorâmica", text: "Envie sua imagem panorâmica ou grande angular." },
        { name: "Definir Divisões", text: "Escolha de 2 a 10 painéis no formato 4:5 vertical ou 1:1 quadrado." },
        { name: "Baixar ZIP do Carrossel", text: "Salve todas as fatias numeradas em um arquivo ZIP pronto para o Instagram." }
      ],
      features: ["Carrossel contínuo sem cortes para Instagram e TikTok", "Formatos ideais 4:5 retrato e 1:1 quadrado", "Fatias numeradas em ordem de postagem", "Download rápido em ZIP"]
    },
    fr: {
      howTo: [
        { name: "Importer le Panorama", text: "Chargez votre photo grand angle ou panoramique." },
        { name: "Choisir le Nombre de Tranches", text: "Définissez de 2 à 10 tuiles au format 4:5 portrait ou 1:1 carré." },
        { name: "Télécharger le Pack ZIP", text: "Récupérez les images numérotées prêtes pour le carrousel Instagram." }
      ],
      features: ["Carrousels fluides et continus sans coupure", "Formats optimisés 4:5 portrait et 1:1 carré", "Numérotation automatique ordonnée", "Téléchargement direct en archive ZIP"]
    }
  },
  'collage-maker': {
    de: {
      howTo: [
        { name: "Fotos Hinzufügen", text: "Wählen Sie mehrere Fotos von Ihrem Gerät aus." },
        { name: "Raster-Layout Wählen", text: "Wählen Sie Vorlagen für 2 bis 9 Fotos, Rahmenabstände und Hintergrundfarben." },
        { name: "Collage Speichern", text: "Laden Sie die fertige Fotocollage in hoher Auflösung herunter." }
      ],
      features: ["Grid-Vorlagen für 2 bis 9 Fotos", "Einstellbare Rahmen, Abstände & Ecken", "Hintergrundfarben & Farbverläufe", "Keine Wasserzeichen"]
    },
    hi: {
      howTo: [
        { name: "मल्टीपल फोटो जोड़ें", text: "कोलाज बनाने के लिए अपनी फोटो सेलेक्ट करें।" },
        { name: "ग्रिड लेआउट चुनें", text: "2 से 9 फोटो के लिए ग्रिड, बॉर्डर स्पेसिंग और बैकग्राउंड सेट करें।" },
        { name: "कोलाज डाउनलोड करें", text: "हाई क्वालिटी में फोटो कोलाज तुरंत सेव करें।" }
      ],
      features: ["2 से 9 फोटो के लिए ग्रिड टेम्पलेट्स", "कस्टमाइजेबल बॉर्डर और कॉर्नर रेडियस", "कलर और ग्रेडिएंट बैकग्राउंड्स", "ज़ीरो वॉटरमार्क"]
    },
    es: {
      howTo: [
        { name: "Añadir Fotos", text: "Selecciona varias imágenes de tu galería." },
        { name: "Elegir Cuadrícula", text: "Selecciona una plantilla para 2 a 9 fotos y ajusta espacios y bordes." },
        { name: "Descargar Collage", text: "Guarda tu fotocollage en alta resolución sin marcas de agua." }
      ],
      features: ["Múltiples cuadrículas para 2 a 9 fotos", "Control de espaciado y bordes redondeados", "Fondos de colores y degradados", "Totalmente gratis"]
    },
    pt: {
      howTo: [
        { name: "Adicionar Imagens", text: "Selecione as fotos que deseja juntar." },
        { name: "Escolher Layout", text: "Defina a grade para 2 a 9 fotos e ajuste bordas e espaçamento." },
        { name: "Baixar Colagem", text: "Salve a montagem final em alta definição." }
      ],
      features: ["Modelos de grade para 2 a 9 fotos", "Controle de espaçamento e cantos arredondados", "Fundos coloridos e degradês", "Sem marcas d'água"]
    },
    fr: {
      howTo: [
        { name: "Ajouter des Photos", text: "Sélectionnez plusieurs photos de votre appareil." },
        { name: "Choisir la Grille", text: "Sélectionnez un modèle pour 2 à 9 photos et personnalisez les bordures." },
        { name: "Télécharger le Pêle-Mêle", text: "Enregistrez votre collage photo en haute définition." }
      ],
      features: ["Grilles variées pour 2 à 9 photos", "Espacement et coins arrondis ajustables", "Fonds unis et dégradés élégants", "Sans filigrane publicitaire"]
    }
  },
  'redact-image': {
    de: {
      howTo: [
        { name: "Dokument oder Foto Hochladen", text: "Wählen Sie das Bild mit sensiblen Daten oder Gesichtern." },
        { name: "Zensurbereiche Markieren", text: "Zeichnen Sie schwarze Balken, Verpixelung oder Unschärfe über vertrauliche Informationen." },
        { name: "Zensiertes Bild Speichern", text: "Laden Sie das geschützte Dokument herunter. Alle Daten bleiben 100% lokal." }
      ],
      features: ["Gesichter verpixeln & unkenntlich machen", "Schwarze Zensurbalken für Text & Ausweise", "Unschärfe & Verpixelungs-Pinsel", "100% offline & sicher für Ausweise & Rechnungen"]
    },
    hi: {
      howTo: [
        { name: "फोटो या डॉक्यूमेंट चुनें", text: "जिस फोटो में प्राइवेट जानकारी छुपानी है उसे लाएं।" },
        { name: "सेंसर एरिया मार्क करें", text: "ब्लैक बार, फेस ब्लर या पिक्सेलेट टूल से सेंसिटिव हिस्से को कवर करें।" },
        { name: "सुरक्षित फोटो डाउनलोड करें", text: "बिना सर्वर पर भेजे एडिटेड फोटो सुरक्षित सेव करें।" }
      ],
      features: ["आधार, पैन कार्ड व बैंक स्टेटमेंट ब्लर", "चेहरों को आसानी से ब्लर व पिक्सेलेट करें", "ब्लैक ज़ोन व ब्रश टूल्स", "100% प्राइवेट व सिक्योर"]
    },
    es: {
      howTo: [
        { name: "Subir Imagen o Documento", text: "Selecciona la foto con datos privados o rostros." },
        { name: "Aplicar Censura", text: "Dibuja barras negras, desenfoque o pixelado sobre la información sensible." },
        { name: "Descargar Imagen Censurada", text: "Guarda la imagen protegida sin ningún envío a servidores externos." }
      ],
      features: ["Pixelado y desenfoque de rostros", "Barras negras para DNI, tarjetas y contratos", "Pinceles de censura ajustables", "100% confidencial en el navegador"]
    },
    pt: {
      howTo: [
        { name: "Carregar Foto ou Documento", text: "Envie a imagem que contém dados pessoais." },
        { name: "Marcar Área a Censurar", text: "Desenhe barras pretas, desfoque ou pixelização sobre dados confidenciais." },
        { name: "Baixar Imagem Protegida", text: "Salve o arquivo seguro sem que nada passe pela internet." }
      ],
      features: ["Desfoque e pixelização de rostos", "Tarjas pretas para CPF, RG e documentos bancários", "Pincel de censura personalizado", "100% confidencial e offline"]
    },
    fr: {
      howTo: [
        { name: "Importer le Document ou Photo", text: "Chargez l'image contenant des informations confidentielles." },
        { name: "Appliquer la Censure", text: "Tracez des bandeaux noirs, du flou ou de la pixellisation sur les zones sensibles." },
        { name: "Télécharger le Document Sécurisé", text: "Enregistrez votre fichier protégé sans passage par le cloud." }
      ],
      features: ["Floutage et pixellisation des visages", "Bandeaux noirs pour pièces d'identité et relevés", "Pinceau de masquage paramétrable", "Traitement 100% confidentiel sur l'appareil"]
    }
  },
  'image-steganography': {
    de: {
      howTo: [
        { name: "Trägerbild Laden", text: "Wählen Sie ein unauffälliges Bild auf Ihrem Gerät." },
        { name: "Geheime Nachricht Eingeben", text: "Geben Sie Ihren geheimen Text und optional ein Passwort ein und betten Sie ihn ein." },
        { name: "Steganographie-Bild Speichern", text: "Laden Sie das Bild herunter, das die Botschaft unsichtbar in den Pixeln trägt." }
      ],
      features: ["Unsichtbare LSB-Pixel-Verschlüsselung", "Passwortgeschützte AES-Verschlüsselung", "Integrierter Text-Decoder", "100% lokale Ausführung"]
    },
    hi: {
      howTo: [
        { name: "फोटो सेलेक्ट करें", text: "कवर फोटो चुनें जिसमें सीक्रेट मैसेज छिपाना है।" },
        { name: "सीक्रेट मैसेज लिखें", text: "अपना मैसेज व पासवर्ड डालें और इमेज में हाइड करें।" },
        { name: "फोटो डाउनलोड करें", text: "पिक्सेल्स में छिपा गुप्त मैसेज वाला फोटो सेव करें।" }
      ],
      features: ["LSB पिक्सेल हाइडिंग टेक्नोलॉजी", "पासवर्ड एन्क्रिप्शन सपोर्ट", "इन-ब्राउज़र सीक्रेट मैसेज डिकोडर", "100% प्राइवेट"]
    },
    es: {
      howTo: [
        { name: "Seleccionar Imagen Portadora", text: "Sube la imagen en la que ocultarás el mensaje." },
        { name: "Escribir Mensaje Secreto", text: "Introduce el texto y contraseña opcional para cifrarlo en los píxeles." },
        { name: "Descargar Imagen con Mensaje", text: "Guarda la imagen con la información oculta de forma invisible." }
      ],
      features: ["Cifrado invisible LSB en píxeles", "Protección opcional por contraseña", "Decodificador integrado", "Procesamiento totalmente local"]
    },
    pt: {
      howTo: [
        { name: "Carregar Imagem Base", text: "Selecione a foto que esconderá a mensagem secreta." },
        { name: "Digitar Texto Oculto", text: "Escreva a mensagem confidencial e senha para codificação nos pixels." },
        { name: "Baixar Imagem Codificada", text: "Salve a foto que contém o texto oculto de forma invisível." }
      ],
      features: ["Ocultação invisível por técnica LSB", "Proteção por senha segura", "Decodificador instantâneo embutido", "Execução 100% no navegador"]
    },
    fr: {
      howTo: [
        { name: "Choisir l'Image Porteuse", text: "Sélectionnez l'image dans laquelle cacher le texte." },
        { name: "Saisir le Message Secret", text: "Entrez votre message et un mot de passe optionnel pour l'encoder dans les pixels." },
        { name: "Télécharger l'Image Modifiée", text: "Enregistrez l'image contenant le message secret de manière invisible." }
      ],
      features: ["Encodage LSB invisible dans les pixels", "Protection par mot de passe sécurisée", "Décodeur de message intégré", "Traitement local sans serveur"]
    }
  }
};

// Map of canonical tool keys to each language's route slug
const langToolKeyMap = {
  de: {
    'image-compressor': 'bild-komprimieren',
    'background-remover': 'hintergrund-entfernen',
    'batch-converter': 'stapel-konverter',
    'sign-pdf': 'pdf-unterschreiben',
    'png-to-jpg': 'png-in-jpg',
    'jpg-to-png': 'jpg-in-png',
    'crop-image': 'bild-zuschneiden',
    'rotate-image': 'bild-drehen',
    'add-border-to-image': 'rahmen-hinzufuegen',
    'photo-filters': 'fotofilter',
    'invert-colors': 'farben-invertieren',
    'adjust-image': 'bild-anpassen',
    'meme-generator': 'meme-generator',
    'watermark-overlay': 'wasserzeichen-hinzufuegen',
    'metadata-stripper': 'metadaten-entfernen',
    'pixel-art-generator': 'pixel-art-generator',
    'ascii-art-generator': 'ascii-art-generator',
    'glitch-image-generator': 'glitch-effekt',
    'side-by-side-image': 'bilder-vergleichen',
    'instagram-panorama-splitter': 'instagram-panorama-teiler',
    'collage-maker': 'fotogitter-erstellen',
    'redact-image': 'bild-zensieren',
    'image-steganography': 'bild-steganographie'
  },
  hi: {
    'image-compressor': 'photo-compress-kare',
    'background-remover': 'background-hataye',
    'batch-converter': 'batch-converter',
    'sign-pdf': 'pdf-sign-kare',
    'png-to-jpg': 'png-se-jpg',
    'jpg-to-png': 'jpg-se-png',
    'crop-image': 'photo-crop-kare',
    'rotate-image': 'photo-rotate-kare',
    'add-border-to-image': 'border-lagaye',
    'photo-filters': 'photo-filters',
    'invert-colors': 'color-invert-kare',
    'adjust-image': 'photo-brightness-contrast',
    'meme-generator': 'meme-generator',
    'watermark-overlay': 'watermark-lagaye',
    'metadata-stripper': 'exif-metadata-hataye',
    'pixel-art-generator': 'pixel-art-generator',
    'ascii-art-generator': 'ascii-art-generator',
    'glitch-image-generator': 'glitch-art-studio',
    'side-by-side-image': 'photo-compare-kare',
    'instagram-panorama-splitter': 'instagram-panorama-splitter',
    'collage-maker': 'photo-grid-maker',
    'redact-image': 'photo-censor-kare',
    'image-steganography': 'image-steganography'
  },
  es: {
    'image-compressor': 'comprimir-imagen',
    'background-remover': 'quitar-fondo',
    'batch-converter': 'convertidor-por-lotes',
    'sign-pdf': 'firmar-pdf',
    'png-to-jpg': 'png-a-jpg',
    'jpg-to-png': 'jpg-a-png',
    'crop-image': 'recortar-imagen',
    'rotate-image': 'rotar-imagen',
    'add-border-to-image': 'agregar-borde-imagen',
    'photo-filters': 'filtros-fotos',
    'invert-colors': 'invertir-colores',
    'adjust-image': 'ajustar-imagen',
    'meme-generator': 'generador-memes',
    'watermark-overlay': 'marca-de-agua',
    'metadata-stripper': 'eliminar-metadatos',
    'pixel-art-generator': 'arte-pixel',
    'ascii-art-generator': 'arte-ascii',
    'glitch-image-generator': 'efecto-glitch',
    'side-by-side-image': 'comparar-fotos',
    'instagram-panorama-splitter': 'panoramica-instagram',
    'collage-maker': 'cuadricula-fotos',
    'redact-image': 'censurar-foto',
    'image-steganography': 'esteganografia-imagenes'
  },
  pt: {
    'image-compressor': 'comprimir-imagem',
    'background-remover': 'remover-fundo',
    'batch-converter': 'conversor-em-lote',
    'sign-pdf': 'assinar-pdf',
    'png-to-jpg': 'png-para-jpg',
    'jpg-to-png': 'jpg-para-png',
    'crop-image': 'cortar-imagem',
    'rotate-image': 'girar-imagem',
    'add-border-to-image': 'adicionar-borda-imagem',
    'photo-filters': 'filtros-fotos',
    'invert-colors': 'inverter-cores',
    'adjust-image': 'ajustar-imagem',
    'meme-generator': 'gerador-memes',
    'watermark-overlay': 'marca-dagua',
    'metadata-stripper': 'remover-metadados',
    'pixel-art-generator': 'arte-pixel',
    'ascii-art-generator': 'arte-ascii',
    'glitch-image-generator': 'efeito-glitch',
    'side-by-side-image': 'comparar-fotos',
    'instagram-panorama-splitter': 'panoramica-instagram',
    'collage-maker': 'grade-fotos',
    'redact-image': 'censurar-foto',
    'image-steganography': 'esteganografia-imagem'
  },
  fr: {
    'image-compressor': 'compresser-image',
    'background-remover': 'supprimer-arriere-plan',
    'batch-converter': 'convertisseur-par-lots',
    'sign-pdf': 'signer-pdf',
    'png-to-jpg': 'png-en-jpg',
    'jpg-to-png': 'jpg-en-png',
    'crop-image': 'recadrer-image',
    'rotate-image': 'pivoter-image',
    'add-border-to-image': 'ajouter-bordure-image',
    'photo-filters': 'filtres-photos',
    'invert-colors': 'inverser-couleurs',
    'adjust-image': 'ajuster-image',
    'meme-generator': 'generateur-memes',
    'watermark-overlay': 'filigrane-image',
    'metadata-stripper': 'supprimer-metadonnees',
    'pixel-art-generator': 'pixel-art',
    'ascii-art-generator': 'art-ascii',
    'glitch-image-generator': 'effet-glitch',
    'side-by-side-image': 'comparer-photos',
    'instagram-panorama-splitter': 'panorama-instagram',
    'collage-maker': 'grille-photos',
    'redact-image': 'censurer-photo',
    'image-steganography': 'steganographie-image'
  }
};

const languages = ['de', 'hi', 'es', 'pt', 'fr'];

languages.forEach(lang => {
  const filePath = path.resolve(`src/locales/${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const keyMap = langToolKeyMap[lang];

  for (const [canonKey, addition] of Object.entries(toolMetadataAdditions)) {
    const localSlug = keyMap[canonKey];
    if (localSlug && data[localSlug]) {
      const langAdd = addition[lang];
      if (langAdd) {
        if (!data[localSlug].howTo || data[localSlug].howTo.length === 0) {
          data[localSlug].howTo = langAdd.howTo;
        }
        if (!data[localSlug].features || data[localSlug].features.length === 0) {
          data[localSlug].features = langAdd.features;
        }
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Enriched ${lang}.json successfully.`);
});
