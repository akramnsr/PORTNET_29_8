package com.a.portnet_back.Services;

import com.a.portnet_back.Models.Marchandise;
import com.a.portnet_back.Models.Pays;
import com.a.portnet_back.Repositories.PaysRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class ExcelImportService {

    private final PaysRepository paysRepository;

    public ExcelImportService(PaysRepository paysRepository) {
        this.paysRepository = paysRepository;
    }


    public List<Marchandise> importMarchandisesFromExcel(MultipartFile file) throws IOException {
        validateExcelFile(file);

        Workbook workbook = createWorkbook(file);
        List<Marchandise> marchandises = new ArrayList<>();

        try {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            if (rowIterator.hasNext()) {
                rowIterator.next();
            }

            int rowNumber = 1;
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                rowNumber++;

                try {
                    Marchandise marchandise = parseMarchandiseFromRow(row, rowNumber);
                    if (marchandise != null) {
                        marchandises.add(marchandise);
                    }
                } catch (Exception e) {
                    throw new RuntimeException("Erreur ligne " + rowNumber + ": " + e.getMessage());
                }
            }

        } finally {
            workbook.close();
        }

        if (marchandises.isEmpty()) {
            throw new RuntimeException("Aucune marchandise valide trouvée dans le fichier Excel");
        }

        return marchandises;
    }

    private Marchandise parseMarchandiseFromRow(Row row, int rowNumber) {

        if (isRowEmpty(row)) {
            return null;
        }

        Marchandise marchandise = new Marchandise();

        try {

            String designation = getCellValueAsString(row.getCell(0));
            if (designation == null || designation.trim().isEmpty()) {
                throw new RuntimeException("La désignation est obligatoire");
            }
            marchandise.setDesignation(designation.trim());

            Double quantite = getCellValueAsDouble(row.getCell(1));
            if (quantite == null || quantite <= 0) {
                throw new RuntimeException("La quantité doit être un nombre positif");
            }
            marchandise.setQuantite(quantite);


            Double montant = getCellValueAsDouble(row.getCell(2));
            if (montant == null || montant <= 0) {
                throw new RuntimeException("Le montant doit être un nombre positif");
            }
            marchandise.setMontant(montant);


            String codeSh = getCellValueAsString(row.getCell(3));
            if (codeSh == null || codeSh.trim().isEmpty()) {
                throw new RuntimeException("Le code SH est obligatoire");
            }
            marchandise.setCodeSh(codeSh.trim());


            String uniteMesure = getCellValueAsString(row.getCell(4));
            marchandise.setUniteMesure(uniteMesure != null ? uniteMesure.trim() : "unité");


            Double poidsNet = getCellValueAsDouble(row.getCell(5));
            marchandise.setPoidsNet(poidsNet);


            Double poidsBrut = getCellValueAsDouble(row.getCell(6));
            marchandise.setPoidsBrut(poidsBrut);


            String description = getCellValueAsString(row.getCell(7));
            marchandise.setDescription(description != null ? description.trim() : null);


            String codePays = getCellValueAsString(row.getCell(8));
            if (codePays != null && !codePays.trim().isEmpty()) {
                Pays pays = paysRepository.findByCode(codePays.trim().toUpperCase())
                        .orElse(null);
                marchandise.setPays(pays);
            }

            return marchandise;

        } catch (Exception e) {
            throw new RuntimeException("Erreur de parsing: " + e.getMessage());
        }
    }

    private void validateExcelFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Le fichier Excel est vide");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.toLowerCase().endsWith(".xlsx") && !filename.toLowerCase().endsWith(".xls"))) {
            throw new RuntimeException("Le fichier doit être au format Excel (.xlsx ou .xls)");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("Le fichier Excel est trop volumineux (max 5MB)");
        }
    }

    private Workbook createWorkbook(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename != null && filename.toLowerCase().endsWith(".xlsx")) {
            return new XSSFWorkbook(file.getInputStream());
        } else {
            return new HSSFWorkbook(file.getInputStream());
        }
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;

        for (int i = 0; i < 4; i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String value = getCellValueAsString(cell);
                if (value != null && !value.trim().isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }

                double numValue = cell.getNumericCellValue();
                if (numValue == (long) numValue) {
                    return String.valueOf((long) numValue);
                }
                return String.valueOf(numValue);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return null;
        }
    }


    private Double getCellValueAsDouble(Cell cell) {
        if (cell == null) return null;

        switch (cell.getCellType()) {
            case NUMERIC:
                return cell.getNumericCellValue();
            case STRING:
                try {
                    String value = cell.getStringCellValue().trim();
                    return value.isEmpty() ? null : Double.parseDouble(value);
                } catch (NumberFormatException e) {
                    return null;
                }
            default:
                return null;
        }
    }


    public byte[] generateExcelTemplate() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Marchandises");


        Row headerRow = sheet.createRow(0);
        String[] headers = {
                "Désignation*", "Quantité*", "Montant*", "Code SH*",
                "Unité", "Poids Net", "Poids Brut", "Description", "Code Pays"
        };

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);


            CellStyle style = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            style.setFont(font);
            cell.setCellStyle(style);
        }


        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }


        Row exampleRow = sheet.createRow(1);
        Object[] exampleData = {
                "Ordinateur portable", 10.0, 15000.0, "8471300000",
                "unité", 2.5, 3.0, "Ordinateur portable 15 pouces", "CN"
        };

        for (int i = 0; i < exampleData.length; i++) {
            Cell cell = exampleRow.createCell(i);
            if (exampleData[i] instanceof String) {
                cell.setCellValue((String) exampleData[i]);
            } else if (exampleData[i] instanceof Double) {
                cell.setCellValue((Double) exampleData[i]);
            }
        }


        java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return outputStream.toByteArray();
    }
}