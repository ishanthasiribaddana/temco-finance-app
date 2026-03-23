package lk.temcobank.finance.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lk.temcobank.finance.dto.PartnerDTO;
import lk.temcobank.finance.dto.PartnerSyncDTO;
import lk.temcobank.finance.service.PartnerService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Path("/partners")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PartnerResource {

    @Inject
    private PartnerService partnerService;

    @GET
    public Response getAllPartners(@QueryParam("type") String type) {
        List<PartnerDTO> partners;
        if ("CUSTOMER".equalsIgnoreCase(type)) {
            partners = partnerService.getCustomers();
        } else if ("VENDOR".equalsIgnoreCase(type)) {
            partners = partnerService.getVendors();
        } else {
            partners = partnerService.getAllPartners();
        }
        return Response.ok(partners).build();
    }

    @GET
    @Path("/counts")
    public Response getCounts() {
        Map<String, Long> counts = Map.of(
            "customers", partnerService.getCustomerCount(),
            "vendors", partnerService.getVendorCount(),
            "total", partnerService.getTotalCount()
        );
        return Response.ok(counts).build();
    }

    @GET
    @Path("/{id}")
    public Response getPartnerById(@PathParam("id") Integer id) {
        Optional<PartnerDTO> partner = partnerService.getPartnerById(id);
        if (partner.isPresent()) {
            return Response.ok(partner.get()).build();
        }
        return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of("error", "Partner not found"))
                .build();
    }

    @GET
    @Path("/code/{code}")
    public Response getPartnerByCode(@PathParam("code") String code) {
        Optional<PartnerDTO> partner = partnerService.getPartnerByCode(code);
        if (partner.isPresent()) {
            return Response.ok(partner.get()).build();
        }
        return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of("error", "Partner not found"))
                .build();
    }

    @POST
    public Response createPartner(PartnerDTO dto) {
        try {
            PartnerDTO created = partnerService.createPartner(dto);
            return Response.status(Response.Status.CREATED).entity(created).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response updatePartner(@PathParam("id") Integer id, PartnerDTO dto) {
        Optional<PartnerDTO> updated = partnerService.updatePartner(id, dto);
        if (updated.isPresent()) {
            return Response.ok(updated.get()).build();
        }
        return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of("error", "Partner not found"))
                .build();
    }

    @DELETE
    @Path("/{id}")
    public Response deletePartner(@PathParam("id") Integer id) {
        partnerService.deletePartner(id);
        return Response.noContent().build();
    }

    @POST
    @Path("/sync")
    public Response syncFromMember(PartnerSyncDTO syncDTO) {
        try {
            PartnerDTO result = partnerService.syncFromMember(syncDTO);
            if (result == null) {
                return Response.ok(Map.of("status", "deleted")).build();
            }
            return Response.ok(result).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/health")
    public Response health() {
        return Response.ok(Map.of("status", "UP", "service", "Partner API")).build();
    }
}
