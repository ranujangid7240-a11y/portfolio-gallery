import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { ThoughtsService } from '../services/thoughts.service';

@Controller('api/thoughts')
export class ThoughtsController {
  constructor(private readonly thoughtsService: ThoughtsService) {}

  @Get()
  async findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.max(1, parseInt(limit) || 10);
    return this.thoughtsService.findAll(p, l);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createDto: any) {
    return this.thoughtsService.create(createDto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.thoughtsService.update(id, updateDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.thoughtsService.remove(id);
  }
}
