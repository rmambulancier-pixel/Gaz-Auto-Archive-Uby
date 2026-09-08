function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Archivage Paie & Décomptes')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function lancerArchivageAutomatique() {
  const idDossierParent = "1ebQ7jd1dCHhVvm0SnythyMpayPgEEUPX";
  const parentFolder = DriveApp.getFolderById(idDossierParent);
  
  const subFolders = parentFolder.getFolders();
  let dossierPaie = null;
  let dossierDecompte = null;

  while (subFolders.hasNext()) {
    const folder = subFolders.next();
    const nom = folder.getName().toLowerCase();
    if (nom.includes("paie") || nom.includes("salaire") || nom.includes("bulletin")) {
      dossierPaie = folder;
    }
    if (nom.includes("decompte") || nom.includes("durée") || nom.includes("duree") || nom.includes("travail") || nom.includes("heure")) {
      dossierDecompte = folder;
    }
  }

  if (!dossierPaie || !dossierDecompte) {
    return "Erreur : dossiers de destination introuvables.";
  }

  const query = 'from:aurelielalannedaste@gmail.com has:attachment filename:pdf -label:archives-aurelie';
  const threads = GmailApp.search(query);

  let label = GmailApp.getUserLabelByName("archives-aurelie");
  if (!label) {
    label = GmailApp.createLabel("archives-aurelie");
  }

  let totalTraites = 0;

  for (let i = 0; i < threads.length; i++) {
    const messages = threads[i].getMessages();
    for (let j = 0; j < messages.length; j++) {
      const attachments = messages[j].getAttachments();
      const sujet = messages[j].getSubject().toLowerCase();

      for (let k = 0; k < attachments.length; k++) {
        const file = attachments[k];
        if (file.getContentType() === "application/pdf") {
          const nomFichier = file.getName().toLowerCase();

          const estDecompte = nomFichier.includes("decompte") ||
                              nomFichier.includes("duree") ||
                              nomFichier.includes("quatorzaine") ||
                              nomFichier.includes("mikael") ||
                              sujet.includes("decompte") ||
                              sujet.includes("conges");

          const estPaie = nomFichier.includes("paie") ||
                          nomFichier.includes("salaire") ||
                          nomFichier.includes("bulletin") ||
                          sujet.includes("paie") ||
                          sujet.includes("bulletin") ||
                          sujet.includes("salaire");

          if (estDecompte && !estPaie) {
            dossierDecompte.createFile(file);
          } else {
            dossierPaie.createFile(file);
          }
          totalTraites++;
        }
      }
    }
    threads[i].addLabel(label);
  }

  return `${totalTraites} document(s) archivé(s) avec succès.`;
}
