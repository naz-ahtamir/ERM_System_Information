import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import * as fs from 'fs';
import * as path from 'path';

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadsService],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should reject file with invalid mimetype', async () => {
      const invalidFile = {
        buffer: Buffer.from('invalid'),
        mimetype: 'application/pdf',
        originalname: 'test.pdf',
        size: 1000,
      };

      await expect(
        service.uploadFile(invalidFile, 'test-element'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject file exceeding 5MB size', async () => {
      const largeFile = {
        buffer: Buffer.alloc(6 * 1024 * 1024), // 6MB
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
        size: 6 * 1024 * 1024,
      };

      await expect(
        service.uploadFile(largeFile, 'test-element'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully upload valid jpeg file', async () => {
      const validFile = {
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
        size: 1000,
      };

      const result = await service.uploadFile(validFile, 'test-element');

      expect(result).toBeDefined();
      expect(result.filePath).toContain('/uploads/smk3/test-element/');
      expect(result.filename).toContain('.jpg');
      expect(result.size).toBe(1000);
      expect(result.mimetype).toBe('image/jpeg');

      // Clean up
      const fullPath = path.join(process.cwd(), 'public', result.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    it('should successfully upload valid png file', async () => {
      const validFile = {
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/png',
        originalname: 'test.png',
        size: 2000,
      };

      const result = await service.uploadFile(validFile, 'test-element');

      expect(result).toBeDefined();
      expect(result.filePath).toContain('/uploads/smk3/test-element/');
      expect(result.filename).toContain('.png');
      expect(result.size).toBe(2000);
      expect(result.mimetype).toBe('image/png');

      // Clean up
      const fullPath = path.join(process.cwd(), 'public', result.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    it('should accept multiple file uploads with different mimetypes', async () => {
      const files = [
        {
          buffer: Buffer.from('fake image 1'),
          mimetype: 'image/jpeg',
          originalname: 'test1.jpg',
          size: 1000,
        },
        {
          buffer: Buffer.from('fake image 2'),
          mimetype: 'image/png',
          originalname: 'test2.png',
          size: 1500,
        },
      ];

      const results = await Promise.all(
        files.map((file) => service.uploadFile(file, 'multi-element')),
      );

      expect(results).toHaveLength(2);
      expect(results[0].filePath).toContain('.jpg');
      expect(results[1].filePath).toContain('.png');

      // Clean up
      results.forEach((result) => {
        const fullPath = path.join(process.cwd(), 'public', result.filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    });

    it('should sanitize filename by adding timestamp and random string', async () => {
      const validFile = {
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
        size: 1000,
      };

      const result1 = await service.uploadFile(validFile, 'test-element');
      const result2 = await service.uploadFile(validFile, 'test-element');

      // Filenames should be different despite same input
      expect(result1.filename).not.toEqual(result2.filename);
      expect(result1.filename).toMatch(/^\d+-.+\.jpg$/);
      expect(result2.filename).toMatch(/^\d+-.+\.jpg$/);

      // Clean up
      [result1, result2].forEach((result) => {
        const fullPath = path.join(process.cwd(), 'public', result.filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    });
  });
});
