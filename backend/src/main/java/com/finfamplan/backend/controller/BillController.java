package com.finfamplan.backend.controller;

import com.finfamplan.backend.model.Bill;
import com.finfamplan.backend.model.Transaction;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.BillRepository;
import com.finfamplan.backend.repository.FinancialProfileRepository;
import com.finfamplan.backend.repository.TransactionRepository;
import com.finfamplan.backend.repository.UserRepository;
import com.finfamplan.backend.security.AccessGuard;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillRepository             billRepo;
    private final UserRepository             userRepo;
    private final TransactionRepository      txRepo;
    private final FinancialProfileRepository fpRepo;
    private final AccessGuard                accessGuard;

    public BillController(BillRepository b, UserRepository u,
                          TransactionRepository t, FinancialProfileRepository f,
                          AccessGuard accessGuard) {
        billRepo = b; userRepo = u; txRepo = t; fpRepo = f; this.accessGuard = accessGuard;
    }

    @GetMapping("/user/{userId}")
    public List<Map<String, Object>> getBills(@PathVariable Long userId, HttpServletRequest request) {
        accessGuard.requireSelf(request, userId);
        return billRepo.findByUser_UserIdOrderByDueDateAsc(userId)
                .stream().map(this::toMap).toList();
    }

    @PostMapping("/user/{userId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createBill(@PathVariable Long userId,
                                          @RequestBody Map<String, Object> body,
                                          HttpServletRequest request) {
        accessGuard.requireSelf(request, userId);
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        String     title  = (String) body.get("title");
        BigDecimal amount = body.get("amount") != null
                ? new BigDecimal(body.get("amount").toString()) : BigDecimal.ZERO;
        boolean    paid   = body.get("paid") != null
                && Boolean.parseBoolean(body.get("paid").toString());
        String     desc   = body.get("description") != null
                ? body.get("description").toString() : null;

        LocalDate dueDate = null;
        if (body.get("dueDate") != null && !body.get("dueDate").toString().isBlank())
            dueDate = LocalDate.parse(body.get("dueDate").toString());

        Bill bill = new Bill();
        bill.setUser(user);
        bill.setTitle(title);
        bill.setAmount(amount);
        bill.setDueDate(dueDate);
        bill.setDescription(desc);
        bill.setPaid(paid);
        if (user.getFamilyGroup() != null) bill.setFamilyGroup(user.getFamilyGroup());
        Bill saved = billRepo.save(bill);

        if (paid && amount.compareTo(BigDecimal.ZERO) > 0) {
            deductAndRecord(user, userId, amount, title, dueDate);
        }

        return toMap(saved);
    }

    @PatchMapping("/{id}/paid")
    public Map<String, Object> togglePaid(@PathVariable Long id,
                                          @RequestBody Map<String, Object> body,
                                          HttpServletRequest request) {
        Bill bill = billRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facture introuvable"));

        if (bill.getUser() == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cette facture n'a aucun utilisateur associé");
        }
        accessGuard.requireSelf(request, bill.getUser().getUserId());

        boolean wasPaid = Boolean.TRUE.equals(bill.getPaid());
        boolean nowPaid = body.get("paid") != null
                && Boolean.parseBoolean(body.get("paid").toString());

        bill.setPaid(nowPaid);
        Bill saved = billRepo.save(bill);

        BigDecimal amount = bill.getAmount() != null ? bill.getAmount() : BigDecimal.ZERO;

        User billUser = bill.getUser();
        if (billUser == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cette facture n'a aucun utilisateur associé");
        }

        if (!wasPaid && nowPaid && amount.compareTo(BigDecimal.ZERO) > 0) {
            deductAndRecord(billUser, billUser.getUserId(),
                    amount, bill.getTitle(), bill.getDueDate());
        } else if (wasPaid && !nowPaid && amount.compareTo(BigDecimal.ZERO) > 0) {
            fpRepo.findByUser_UserId(billUser.getUserId()).ifPresent(fp -> {
                BigDecimal bal = fp.getCurrentBalance() != null
                        ? fp.getCurrentBalance() : BigDecimal.ZERO;
                fp.setCurrentBalance(bal.add(amount));
                fpRepo.save(fp);
            });
            Transaction tx = new Transaction();
            tx.setUser(billUser);
            tx.setType("INCOME");
            tx.setCategory("BILL_REVERSAL");
            tx.setAmount(amount);
            tx.setDescription("Facture annulée : " + bill.getTitle());
            tx.setDate(LocalDate.now());
            txRepo.save(tx);
        }

        return toMap(saved);
    }

    private void deductAndRecord(User user, Long userId,
                                 BigDecimal amount, String title, LocalDate dueDate) {
        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setType("EXPENSE");
        tx.setCategory("BILLS");
        tx.setAmount(amount);
        tx.setDescription("Facture payée : " + title);
        tx.setDate(dueDate != null ? dueDate : LocalDate.now());
        txRepo.save(tx);

        fpRepo.findByUser_UserId(userId).ifPresent(fp -> {
            BigDecimal bal = fp.getCurrentBalance() != null
                    ? fp.getCurrentBalance() : BigDecimal.ZERO;
            fp.setCurrentBalance(bal.subtract(amount));
            fpRepo.save(fp);
        });
    }

    private Map<String, Object> toMap(Bill b) {
        return Map.of(
                "id",          b.getId(),
                "title",       b.getTitle()       != null ? b.getTitle()       : "",
                "amount",      b.getAmount()      != null ? b.getAmount()      : BigDecimal.ZERO,
                "dueDate",     b.getDueDate()     != null ? b.getDueDate().toString() : "",
                "description", b.getDescription() != null ? b.getDescription() : "",
                "paid",        b.getPaid()        != null && b.getPaid()
        );
    }
}
