package com.a.portnet_back.Utils;

public class UserAgentParser {

    public static String extractBrowser(String userAgent) {
        if (userAgent.contains("Chrome")) return "Chrome";
        if (userAgent.contains("Firefox")) return "Firefox";
        if (userAgent.contains("Safari")) return "Safari";
        if (userAgent.contains("Edge")) return "Edge";
        return "Autre";
    }

    public static String extractDevice(String userAgent) {
        if (userAgent.toLowerCase().contains("mobile")) return "Mobile";
        if (userAgent.toLowerCase().contains("tablet")) return "Tablet";
        if (userAgent.toLowerCase().contains("windows") || userAgent.toLowerCase().contains("mac")) return "Desktop";
        return "Inconnu";
    }
}
