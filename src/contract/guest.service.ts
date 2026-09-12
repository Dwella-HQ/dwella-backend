import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest } from './entities/guest.entity';
import { FileService } from 'src/file/file.service';
import { CreateShortletContractDto } from './dto/create-shortlet-contract.dto';

@Injectable()
export class GuestService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
    private readonly fileService: FileService,
  ) {}

  async findOne(id: string) {
    const guest = await this.guestRepository.findOne({ where: { id } });
    if (!guest) {
      throw new NotFoundException('Guest not found');
    }
    return guest;
  }

  /** Reuses an existing guest by email when one exists, otherwise creates a new one. */
  async findOrCreate(dto: CreateShortletContractDto) {
    if (dto.guestEmail) {
      const existing = await this.guestRepository.findOne({
        where: { email: dto.guestEmail },
      });
      if (existing) return existing;
    }
    const guest = this.guestRepository.create({
      fullName: dto.guestFullName,
      email: dto.guestEmail,
      phoneNumber: dto.guestPhoneNumber,
      idType: dto.guestIdType,
      idNumber: dto.guestIdNumber,
    });
    if (dto.guestIdDocumentId) {
      guest.idDocument = await this.fileService.findFileById(
        dto.guestIdDocumentId,
      );
    }
    return this.guestRepository.save(guest);
  }
}
