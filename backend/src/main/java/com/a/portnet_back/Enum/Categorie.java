package com.a.portnet_back.Enum;

public enum Categorie {
    IMPORTATION,
    EXPORTATION;


    public String getDescription() {
        switch(this) {
            case IMPORTATION: return "Importation";
            case EXPORTATION: return "Exportation";
            default: return this.name();
        }
    }
}
