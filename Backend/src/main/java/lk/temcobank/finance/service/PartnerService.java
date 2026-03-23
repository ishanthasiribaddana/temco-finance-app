package lk.temcobank.finance.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import lk.temcobank.finance.dto.PartnerDTO;
import lk.temcobank.finance.dto.PartnerSyncDTO;
import lk.temcobank.finance.entity.Partner;
import lk.temcobank.finance.repository.PartnerRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@ApplicationScoped
public class PartnerService {

    @Inject
    private PartnerRepository partnerRepository;

    public List<PartnerDTO> getAllPartners() {
        return partnerRepository.findAll().stream()
                .map(PartnerDTO::new)
                .collect(Collectors.toList());
    }

    public List<PartnerDTO> getCustomers() {
        return partnerRepository.findByType(Partner.PartnerType.CUSTOMER).stream()
                .map(PartnerDTO::new)
                .collect(Collectors.toList());
    }

    public List<PartnerDTO> getVendors() {
        return partnerRepository.findByType(Partner.PartnerType.VENDOR).stream()
                .map(PartnerDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<PartnerDTO> getPartnerById(Integer id) {
        return partnerRepository.findById(id).map(PartnerDTO::new);
    }

    public Optional<PartnerDTO> getPartnerByCode(String partnerCode) {
        return partnerRepository.findByPartnerCode(partnerCode).map(PartnerDTO::new);
    }

    @Transactional
    public PartnerDTO createPartner(PartnerDTO dto) {
        Partner partner = new Partner();
        partner.setPartnerCode(dto.getPartnerCode() != null ? dto.getPartnerCode() : 
            partnerRepository.generatePartnerCode(Partner.PartnerType.valueOf(dto.getPartnerType())));
        partner.setPartnerName(dto.getPartnerName());
        partner.setPartnerType(Partner.PartnerType.valueOf(dto.getPartnerType()));
        partner.setUserProfileId(dto.getUserProfileId());
        partner.setOrganizationId(dto.getOrganizationId());
        partner.setTaxId(dto.getTaxId());
        partner.setCreditLimit(dto.getCreditLimit() != null ? dto.getCreditLimit() : BigDecimal.ZERO);
        partner.setPaymentTermsDays(dto.getPaymentTermsDays() != null ? dto.getPaymentTermsDays() : 30);
        partner.setDefaultAccountId(dto.getDefaultAccountId());
        partner.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        Partner saved = partnerRepository.save(partner);
        return new PartnerDTO(saved);
    }

    @Transactional
    public Optional<PartnerDTO> updatePartner(Integer id, PartnerDTO dto) {
        Optional<Partner> existing = partnerRepository.findById(id);
        if (existing.isEmpty()) {
            return Optional.empty();
        }

        Partner partner = existing.get();
        partner.setPartnerName(dto.getPartnerName());
        partner.setPartnerType(Partner.PartnerType.valueOf(dto.getPartnerType()));
        partner.setTaxId(dto.getTaxId());
        partner.setCreditLimit(dto.getCreditLimit());
        partner.setPaymentTermsDays(dto.getPaymentTermsDays());
        partner.setDefaultAccountId(dto.getDefaultAccountId());
        partner.setIsActive(dto.getIsActive());

        Partner saved = partnerRepository.save(partner);
        return Optional.of(new PartnerDTO(saved));
    }

    @Transactional
    public void deletePartner(Integer id) {
        partnerRepository.delete(id);
    }

    @Transactional
    public PartnerDTO syncFromMember(PartnerSyncDTO syncDTO) {
        String action = syncDTO.getAction() != null ? syncDTO.getAction().toUpperCase() : "CREATE";

        switch (action) {
            case "DELETE":
                Optional<Partner> toDelete = partnerRepository.findByUserProfileId(syncDTO.getMemberId().intValue());
                toDelete.ifPresent(p -> partnerRepository.delete(p.getId()));
                return null;

            case "UPDATE":
                Optional<Partner> existing = partnerRepository.findByUserProfileId(syncDTO.getMemberId().intValue());
                if (existing.isPresent()) {
                    Partner partner = existing.get();
                    partner.setPartnerName(syncDTO.getFullName());
                    if (syncDTO.getTaxId() != null) partner.setTaxId(syncDTO.getTaxId());
                    if (syncDTO.getCreditLimit() != null) partner.setCreditLimit(syncDTO.getCreditLimit());
                    if (syncDTO.getPaymentTermsDays() != null) partner.setPaymentTermsDays(syncDTO.getPaymentTermsDays());
                    Partner saved = partnerRepository.save(partner);
                    return new PartnerDTO(saved);
                }
                // Fall through to CREATE if not exists

            case "CREATE":
            default:
                Optional<Partner> check = partnerRepository.findByUserProfileId(syncDTO.getMemberId().intValue());
                if (check.isPresent()) {
                    return new PartnerDTO(check.get());
                }

                Partner partner = new Partner();
                partner.setPartnerCode(partnerRepository.generatePartnerCode(Partner.PartnerType.CUSTOMER));
                partner.setPartnerName(syncDTO.getFullName());
                partner.setPartnerType(Partner.PartnerType.CUSTOMER);
                partner.setUserProfileId(syncDTO.getMemberId().intValue());
                partner.setTaxId(syncDTO.getTaxId());
                partner.setCreditLimit(syncDTO.getCreditLimit() != null ? syncDTO.getCreditLimit() : BigDecimal.ZERO);
                partner.setPaymentTermsDays(syncDTO.getPaymentTermsDays() != null ? syncDTO.getPaymentTermsDays() : 30);
                partner.setIsActive(true);

                Partner saved = partnerRepository.save(partner);
                return new PartnerDTO(saved);
        }
    }

    public long getCustomerCount() {
        return partnerRepository.countByType(Partner.PartnerType.CUSTOMER);
    }

    public long getVendorCount() {
        return partnerRepository.countByType(Partner.PartnerType.VENDOR);
    }

    public long getTotalCount() {
        return partnerRepository.countAll();
    }
}
