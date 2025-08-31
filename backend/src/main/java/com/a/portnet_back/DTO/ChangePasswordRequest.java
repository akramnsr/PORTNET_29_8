// src/main/java/com/a/portnet_back/DTO/ChangePasswordRequest.java
package com.a.portnet_back.DTO;

public class ChangePasswordRequest {
    // formats possibles envoyés par le front
    private String currentPassword; // essai 1
    private String oldPassword;     // essai 2 & 3
    private String newPassword;     // essai 1 & 2
    private String password;        // essai 3
    private String confirmPassword; // essai 1 (facultatif)

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

    public String getOldPassword() { return oldPassword; }
    public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
}
