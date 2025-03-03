import { axiosWithJWT } from "../config/axiosConfig";
import { PaginatedResponse } from "../global";

class BusService {
    static BASE_URL = "http://localhost:8080";

    static async fetchBusData({ page, pageSize }: { page: number; pageSize: number }) {
        try {
            const response = await axiosWithJWT.get<PaginatedResponse>(
                `${BusService.BASE_URL}/api/v1/buses`,
                {
                    params: {
                        pageNumber: page,
                        pageSize: pageSize,
                    },
                }
            );
            return response;
        } catch (err) {
            throw err;
        }
    }

    static deleteBus = async (busId: string) => {
        return await axiosWithJWT.delete(`http://localhost:8080/api/v1/buses/${busId}`);
    };
}

export default BusService;
