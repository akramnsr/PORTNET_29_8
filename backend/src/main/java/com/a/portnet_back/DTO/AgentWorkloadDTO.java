package com.a.portnet_back.DTO;

public class AgentWorkloadDTO {
    private Long agentId;
    private String agent;

    private int dossiersTotal;
    private int enCours;
    private int enRetard;

    private int slaMedianMin;
    private int tempsMoyenMin;
    private int productiviteJ;

    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public String getAgent() { return agent; }
    public void setAgent(String agent) { this.agent = agent; }

    public int getDossiersTotal() { return dossiersTotal; }
    public void setDossiersTotal(int dossiersTotal) { this.dossiersTotal = dossiersTotal; }

    public int getEnCours() { return enCours; }
    public void setEnCours(int enCours) { this.enCours = enCours; }

    public int getEnRetard() { return enRetard; }
    public void setEnRetard(int enRetard) { this.enRetard = enRetard; }

    public int getSlaMedianMin() { return slaMedianMin; }
    public void setSlaMedianMin(int slaMedianMin) { this.slaMedianMin = slaMedianMin; }

    public int getTempsMoyenMin() { return tempsMoyenMin; }
    public void setTempsMoyenMin(int tempsMoyenMin) { this.tempsMoyenMin = tempsMoyenMin; }

    public int getProductiviteJ() { return productiviteJ; }
    public void setProductiviteJ(int productiviteJ) { this.productiviteJ = productiviteJ; }
}
