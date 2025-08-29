// VerificationTokenRepository.java - Nouveau repository pour les tokens
package com.a.portnet_back.Repositories;

import com.a.portnet_back.Models.VerificationToken;
import com.a.portnet_back.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {


    Optional<VerificationToken> findByToken(String token);


    Optional<VerificationToken> findByUser(User user);

    @Query("SELECT vt FROM VerificationToken vt WHERE vt.user.id = :userId")
    Optional<VerificationToken> findByUserId(@Param("userId") Long userId);


    @Query("DELETE FROM VerificationToken vt WHERE vt.expiration < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);


    @Query("SELECT vt FROM VerificationToken vt WHERE vt.expiration < :now")
    List<VerificationToken> findExpiredTokens(@Param("now") LocalDateTime now);


    @Query("SELECT CASE WHEN COUNT(vt) > 0 THEN true ELSE false END FROM VerificationToken vt WHERE vt.token = :token AND vt.expiration > :now")
    boolean existsByTokenAndNotExpired(@Param("token") String token, @Param("now") LocalDateTime now);
}