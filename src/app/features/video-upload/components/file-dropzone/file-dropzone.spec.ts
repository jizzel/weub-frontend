import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDropzone } from './file-dropzone';

describe('FileDropzone', () => {
  let component: FileDropzone;
  let fixture: ComponentFixture<FileDropzone>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileDropzone]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileDropzone);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
