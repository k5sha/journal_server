import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SubjectsService } from 'src/subjects/subjects.service';
import { AddSubjectInput } from './dto/addSubject-user.input';
import { Teacher } from './entities/teacher.entity';
import { Student } from './entities/student.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Teacher) private teacherRepository: Repository<Teacher>,
    @InjectRepository(Student) private studentRepository: Repository<Student>,
    private subjectsService: SubjectsService,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    const newUser = this.userRepository.create(createUserInput);

    if (createUserInput.type == 'TEACHER') {
      const teacherAccount = this.teacherRepository.create();

      await this.teacherRepository.save(teacherAccount);

      newUser.teacher = teacherAccount;
    } else {
      const studentAccount = this.studentRepository.create();

      await this.studentRepository.save(studentAccount);

      newUser.student = studentAccount;
    }

    return this.userRepository.save(newUser);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOneById(id: number) {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  findOneByUsername(username: string) {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  async addSubjectToTeacher(addSubjectInput: AddSubjectInput) {
    const user = await this.findOneById(addSubjectInput.teacherId);

    if (!user || !user.teacher) {
      throw new Error('Teacher not exists!');
    }

    const teacher = user.teacher;

    const subject = await this.subjectsService.findOne(
      addSubjectInput.subjectId,
    );

    if (!subject) {
      throw new Error('Subject not exists!');
    }

    if (
      teacher.subjects.some(
        (old_subjects) => old_subjects.title == subject.title,
      )
    ) {
      throw new Error('Subject already added!');
    }

    teacher.subjects.push(subject);

    return this.userRepository.save(teacher);
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    return this.userRepository.update(id, updateUserInput);
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }
}
