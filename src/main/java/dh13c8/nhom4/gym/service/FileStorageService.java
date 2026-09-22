package dh13c8.nhom4.gym.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final String UPLOAD_DIR = "uploads/";

    /**
     * Lưu file upload và trả về đường dẫn tương đối.
     * 
     * @param file file upload
     * @return đường dẫn tương đối (ví dụ: /uploads/123456789_avatar.jpg)
     * @throws IOException nếu có lỗi khi lưu file
     */
    public String saveFile(MultipartFile file) throws IOException {
        // Tạo thư mục nếu chưa có
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Tạo tên file mới
        String originalFilename = file.getOriginalFilename();
        String sanitizedFilename = sanitize(originalFilename != null ? originalFilename : "file");
        String fileName = System.currentTimeMillis() + "_" + sanitizedFilename;

        // Lưu file
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Trả về đường dẫn tương đối
        return "/uploads/" + fileName;
    }

    /**
     * Sanitize tên file: chỉ giữ lại a-z, A-Z, 0-9, dấu chấm, gạch ngang, gạch dưới.
     */
    private String sanitize(String filename) {
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
