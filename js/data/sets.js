function card(es, en, hint, exampleEs, exampleEn, extra = {}) {
  return { es, en, hint, exampleEs, exampleEn, ...extra };
}

export const SETS = {
  Greetings: [
    card("Hola", "Hello", "OH-lah", "Hola, ¿cómo estás?", "Hi, how are you?"),
    card("Buenos días", "Good morning", "BWEH-nohs DEE-ahs", "Buenos días.", "Good morning."),
    card("Buenas tardes", "Good afternoon", "BWEH-nahs TAR-dehs", "Buenas tardes.", "Good afternoon."),
    card("Buenas noches", "Good evening / good night", "BWEH-nahs NOH-chehs", "Buenas noches.", "Good night."),
    card("¿Cómo estás?", "How are you?", "KOH-moh ehs-TAHS", "Hola, ¿cómo estás?", "Hi, how are you?"),
    card("Bien, gracias", "Good, thanks", "BYEHN GRAH-syahs", "Bien, gracias. ¿Y tú?", "Good, thanks. And you?"),
    card("Por favor", "Please", "por fah-VOR", "Un café, por favor.", "A coffee, please."),
    card("Gracias", "Thank you", "GRAH-syahs", "Gracias.", "Thank you."),
    card("De nada", "You're welcome", "deh NAH-dah", "De nada.", "You're welcome."),
    card("Perdón", "Excuse me / sorry", "pehr-DOHN", "Perdón.", "Excuse me."),
    card("Adiós", "Goodbye", "ah-DYOHS", "Adiós.", "Goodbye."),
    card("Hasta luego", "See you later", "AHS-tah LWEH-goh", "Hasta luego.", "See you later.")
  ],
  Basics: [
    card("Me llamo…", "My name is…", "meh YAH-moh", "Me llamo {name}.", "My name is {name}."),
    card("¿Cómo te llamas?", "What's your name?", "KOH-moh teh YAH-mahs", "¿Cómo te llamas?", "What's your name?"),
    card("Soy de…", "I'm from…", "soy deh", "Soy de Miami.", "I'm from Miami."),
    card("Hablo un poco de español", "I speak a little Spanish", "AH-bloh oon POH-koh", "Hablo un poco de español.", "I speak a little Spanish."),
    card("No entiendo", "I don't understand", "noh ehn-TYEHN-doh", "No entiendo.", "I don't understand."),
    card("Más despacio, por favor", "More slowly, please", "mahs dehs-PAH-syoh", "Más despacio, por favor.", "More slowly, please."),
    card("¿Puede repetir?", "Can you repeat that?", "PWEH-deh reh-peh-TEER", "¿Puede repetir, por favor?", "Can you repeat that, please?"),
    card("¿Cuánto cuesta?", "How much is it?", "KWAN-toh KWEHS-tah", "¿Cuánto cuesta?", "How much is it?"),
    card("¿Dónde está el baño?", "Where is the bathroom?", "DOHN-deh ehs-TAH", "¿Dónde está el baño?", "Where is the bathroom?"),
    card("Necesito ayuda", "I need help", "neh-seh-SEE-toh ah-YOO-dah", "Necesito ayuda.", "I need help."),
    card("Sí / No", "Yes / No", "see / noh", "Sí, por favor. No, gracias.", "Yes, please. No, thanks.")
  ],
  Café: [
    card("Un café, por favor", "A coffee, please", "oon kah-FEH", "Un café, por favor.", "A coffee, please."),
    card("Un café con leche", "A coffee with milk", "kohn LEH-cheh", "Un café con leche.", "A coffee with milk."),
    card("Agua, por favor", "Water, please", "AH-gwah", "Agua, por favor.", "Water, please."),
    card("Sin hielo", "No ice", "seen YEH-loh", "Sin hielo, por favor.", "No ice, please."),
    card("Un jugo de naranja", "An orange juice", "HOO-goh", "Un jugo de naranja.", "An orange juice."),
    card("La cuenta, por favor", "The check, please", "lah KWEHN-tah", "La cuenta, por favor.", "The check, please."),
    card("Quisiera…", "I would like…", "kee-SYEH-rah", "Quisiera un té.", "I would like a tea."),
    card("¿Algo más?", "Anything else?", "AHL-goh mahs", "¿Algo más?", "Anything else?"),
    card("Está rico", "It's delicious", "ehs-TAH REE-koh", "Está rico.", "It's delicious."),
    card("Tengo hambre", "I'm hungry", "TEN-goh AHM-breh", "Tengo hambre.", "I'm hungry."),
    card("Tengo sed", "I'm thirsty", "TEN-goh sehd", "Tengo sed.", "I'm thirsty.")
  ],
  Food: [
    card("El arroz", "Rice", "ehl ah-ROHS", "Arroz con pollo.", "Rice with chicken."),
    card("El pollo", "Chicken", "ehl POH-yoh", "Pollo asado.", "Roasted chicken."),
    card("La carne", "Meat", "lah KAR-neh", "Carne asada.", "Grilled meat."),
    card("El pescado", "Fish", "ehl pehs-KAH-doh", "Pescado frito.", "Fried fish."),
    card("La ensalada", "Salad", "lah ehn-sah-LAH-dah", "Una ensalada, por favor.", "A salad, please."),
    card("El pan", "Bread", "ehl pahn", "Pan, por favor.", "Bread, please."),
    card("Sin cebolla", "No onion", "seen seh-BOH-yah", "Sin cebolla, por favor.", "No onion, please."),
    card("Para llevar", "To go", "PAH-rah yeh-VAHR", "Para llevar, por favor.", "To go, please."),
    card("¿Qué recomienda?", "What do you recommend?", "keh reh-koh-MYEHN-dah", "¿Qué recomienda?", "What do you recommend?"),
    card("La propina", "The tip", "lah proh-PEE-nah", "La propina.", "The tip.")
  ],
  Market: [
    card("El mercado", "The market", "ehl mehr-KAH-doh", "Voy al mercado.", "I'm going to the market."),
    card("Las manzanas", "The apples", "mahn-SAH-nahs", "Quisiera las manzanas.", "I would like the apples."),
    card("Los tomates", "The tomatoes", "toh-MAH-tehs", "Dos tomates, por favor.", "Two tomatoes, please."),
    card("Más barato", "Cheaper", "bah-RAH-toh", "¿Hay algo más barato?", "Is there something cheaper?"),
    card("Está caro", "It's expensive", "ehs-TAH KAH-roh", "Está caro.", "It's expensive."),
    card("Media docena", "Half a dozen", "MEH-dyah doh-SEH-nah", "Media docena, por favor.", "Half a dozen, please."),
    card("¿Acepta tarjeta?", "Do you take cards?", "ah-SEHP-tah tar-HEH-tah", "¿Acepta tarjeta?", "Do you take cards?"),
    card("En efectivo", "In cash", "ehn eh-fehk-TEE-voh", "Pago en efectivo.", "I pay in cash.")
  ],
  Around: [
    card("A la derecha", "To the right", "ah lah deh-REH-chah", "A la derecha.", "To the right."),
    card("A la izquierda", "To the left", "ah lah ees-KYEHR-dah", "A la izquierda.", "To the left."),
    card("Todo recto", "Straight ahead", "TOH-doh REHK-toh", "Todo recto.", "Straight ahead."),
    card("Está cerca", "It's nearby", "ehs-TAH SEHR-kah", "Está cerca.", "It's nearby."),
    card("Está lejos", "It's far", "ehs-TAH LEH-hohs", "Está lejos.", "It's far."),
    card("El aeropuerto", "The airport", "ah-eh-roh-PWEHR-toh", "El aeropuerto.", "The airport."),
    card("Un boleto", "A ticket", "boo-LEH-toh", "Un boleto, por favor.", "A ticket, please."),
    card("¿A qué hora sale?", "What time does it leave?", "ah keh OH-rah SAH-leh", "¿A qué hora sale?", "What time does it leave?"),
    card("Estoy perdido", "I'm lost", "ehs-TOY pehr-DEE-doh", "Estoy perdido.", "I'm lost."),
    card("¿Me puede ayudar?", "Can you help me?", "meh PWEH-deh ah-yoo-DAHR", "¿Me puede ayudar?", "Can you help me?")
  ],
  Hotel: [
    card("Tengo una reserva", "I have a reservation", "reh-SEHR-vah", "Tengo una reserva.", "I have a reservation."),
    card("Una habitación", "A room", "ah-bee-tah-SYOHN", "Una habitación, por favor.", "A room, please."),
    card("La llave", "The key", "lah YAH-beh", "La llave, por favor.", "The key, please."),
    card("El wifi", "The wifi", "ehl WEE-fee", "¿Cuál es la clave del wifi?", "What is the wifi password?"),
    card("¿A qué hora es el desayuno?", "What time is breakfast?", "deh-sah-YOO-noh", "¿A qué hora es el desayuno?", "What time is breakfast?"),
    card("¿Puede llamar un taxi?", "Can you call a taxi?", "tahk-SEE", "¿Puede llamar un taxi?", "Can you call a taxi?")
  ],
  Family: [
    card("Mi familia", "My family", "mee fah-MEE-lyah", "Mi familia.", "My family."),
    card("Mi mamá", "My mom", "mee mah-MAH", "Mi mamá.", "My mom."),
    card("Mi papá", "My dad", "mee pah-PAH", "Mi papá.", "My dad."),
    card("Mi hermano", "My brother", "mee ehr-MAH-noh", "Mi hermano.", "My brother."),
    card("Mi hermana", "My sister", "mee ehr-MAH-nah", "Mi hermana.", "My sister."),
    card("Mis padres", "My parents", "mees PAH-drehs", "Mis padres.", "My parents."),
    card("Mi amigo / mi amiga", "My friend", "ah-MEE-goh", "Mi amigo.", "My friend."),
    card("Tengo un hermano", "I have a brother", "TEN-goh", "Tengo un hermano.", "I have a brother.")
  ],
  Time: [
    card("¿Qué hora es?", "What time is it?", "keh OH-rah ehs", "¿Qué hora es?", "What time is it?"),
    card("Son las tres", "It's three o'clock", "sohn lahs trehs", "Son las tres.", "It's three."),
    card("Hoy", "Today", "oy", "Hoy.", "Today."),
    card("Mañana", "Tomorrow / morning", "mah-NYAH-nah", "Hasta mañana.", "See you tomorrow."),
    card("Ayer", "Yesterday", "ah-YEHR", "Ayer.", "Yesterday."),
    card("Ahora", "Now", "ah-OH-rah", "Ahora.", "Now."),
    card("Temprano", "Early", "tehm-PRAH-noh", "Temprano.", "Early."),
    card("Tarde", "Late / afternoon", "TAR-deh", "Más tarde.", "Later."),
    card("El lunes", "Monday", "ehl LOO-nehs", "El lunes.", "Monday."),
    card("El fin de semana", "The weekend", "ehl feen deh seh-MAH-nah", "El fin de semana.", "The weekend.")
  ],
  Numbers: [
    card("uno", "one", "OO-noh", "Uno.", "One."),
    card("dos", "two", "dohs", "Dos.", "Two."),
    card("tres", "three", "trehs", "Tres.", "Three."),
    card("cuatro", "four", "KWAH-troh", "Cuatro.", "Four."),
    card("cinco", "five", "SEEN-koh", "Cinco.", "Five."),
    card("seis", "six", "says", "Seis.", "Six."),
    card("siete", "seven", "SYEH-teh", "Siete.", "Seven."),
    card("ocho", "eight", "OH-choh", "Ocho.", "Eight."),
    card("nueve", "nine", "NWEH-veh", "Nueve.", "Nine."),
    card("diez", "ten", "dyehs", "Diez.", "Ten."),
    card("quince", "fifteen", "KEEN-seh", "Quince.", "Fifteen."),
    card("veinte", "twenty", "BAYN-teh", "Veinte.", "Twenty."),
    card("treinta", "thirty", "TRAYN-tah", "Treinta.", "Thirty.")
  ],
  Weather: [
    card("Hace calor", "It's hot", "AH-seh kah-LOHR", "Hace calor hoy.", "It's hot today."),
    card("Hace frío", "It's cold", "AH-seh FREE-oh", "Hace frío.", "It's cold."),
    card("Está lloviendo", "It's raining", "eh-stah yoh-VYEN-doh", "Está lloviendo.", "It's raining."),
    card("El sol", "The sun", "ehl sohl", "Hay mucho sol.", "There's a lot of sun."),
    card("Una chaqueta", "A jacket", "oo-nah chah-KEH-tah", "Necesito una chaqueta.", "I need a jacket.")
  ],
  Feelings: [
    card("Estoy bien", "I'm well", "ehs-TOY byehn", "Estoy bien.", "I'm well."),
    card("Estoy cansado", "I'm tired", "kahn-SAH-doh", "Estoy cansado.", "I'm tired."),
    card("Estoy feliz", "I'm happy", "feh-LEES", "Estoy feliz.", "I'm happy."),
    card("Me duele", "It hurts", "meh DWEH-leh", "Me duele la cabeza.", "My head hurts."),
    card("Tengo sueño", "I'm sleepy", "TEN-goh SWEH-nyoh", "Tengo sueño.", "I'm sleepy.")
  ]
};

export const SET_ORDER = Object.keys(SETS);

export function allPhrases() {
  return SET_ORDER.flatMap((setName) =>
    SETS[setName].map((word) => ({
      ...word,
      set: setName,
      id: `${setName}::${word.es}`
    }))
  );
}

export function phrasesIn(setName) {
  return (SETS[setName] || []).map((word) => ({
    ...word,
    set: setName,
    id: `${setName}::${word.es}`
  }));
}

export function findPhrase(id) {
  return allPhrases().find((word) => word.id === id) || null;
}

export function clozeFrom(word) {
  const haystack = word.exampleEs || word.es;
  const target = word.es.replace(/[…¿¡]/g, "").split(/[/,]/)[0].trim();
  const pieces = target.split(/\s+/).filter((part) => part.length > 2);
  const needle = pieces.sort((a, b) => b.length - a.length)[0] || target.split(/\s+/)[0];
  const pattern = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (!pattern.test(haystack)) {
    return { prompt: "____", answer: target, full: haystack };
  }
  return {
    prompt: haystack.replace(pattern, "____"),
    answer: haystack.match(pattern)[0],
    full: haystack
  };
}
