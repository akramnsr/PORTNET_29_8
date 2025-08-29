package com.a.portnet_back.Services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {


    @Value("${jwt.secret:your-very-secure-secret-key-that-is-at-least-32-characters-long}")
    private String secretKey;

    private final int ACCESS_TOKEN_VALIDITY = 1;
    private final int REFRESH_TOKEN_VALIDITY = 7;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateAccessToken(UserDetails user) {
        return generateToken(user, ACCESS_TOKEN_VALIDITY, ChronoUnit.HOURS);
    }

    public String generateRefreshToken(UserDetails user) {
        return generateToken(user, REFRESH_TOKEN_VALIDITY, ChronoUnit.DAYS);
    }

    public String generateToken(UserDetails user, int validity, ChronoUnit unit)
    {
        Map<String, Object> claims = new HashMap<>();
        claims.put("authorities", user.getAuthorities());
        claims.put("type", unit == ChronoUnit.HOURS ? "access" : "refresh");

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(Date.from(Instant.now().plus(validity, unit)))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        try {
            return extractAllClaims(token).getSubject();
        } catch (JwtException e) {
            throw new IllegalArgumentException("Token JWT invalide", e);
        }
    }

    public boolean isTokenValid(String token, UserDetails user) {
        try {
            String username = extractUsername(token);
            return username.equals(user.getUsername()) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isAccessToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return "access".equals(claims.get("type"));
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isRefreshToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return "refresh".equals(claims.get("type"));
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            Date expiration = extractAllClaims(token).getExpiration();
            return expiration.before(new Date());
        } catch (JwtException e) {
            return true;
        }
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public long getExpirationTime(String token) {
        try {
            Date expiration = extractAllClaims(token).getExpiration();
            return expiration.getTime();
        } catch (Exception e) {
            return 0;
        }
    }
}